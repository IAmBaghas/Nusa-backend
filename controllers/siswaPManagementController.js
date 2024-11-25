const pool = require('../config/database');
const path = require('path');

// Get all student posts with details
const getAllPosts = async (req, res) => {
    try {
        // Verify admin access
        if (req.user?.type !== 'web_admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const result = await pool.query(`
            WITH post_images AS (
                SELECT 
                    sg.siswapost_id,
                    json_agg(
                        json_build_object(
                            'id', fs.id,
                            'file', fs.file,
                            'judul', fs.judul
                        ) ORDER BY fs.id
                    ) as images
                FROM siswaglr sg
                JOIN foto_siswa fs ON sg.id = fs.siswaglr_id
                GROUP BY sg.siswapost_id
            )
            SELECT 
                sp.id,
                sp.caption,
                sp.likes_count,
                sp.created_at,
                sp.updated_at,
                sp.status,
                p.id as profile_id,
                p.username,
                p.full_name,
                p.profile_image,
                COALESCE(pi.images, '[]'::json) as images,
                CASE 
                    WHEN sp.status = true THEN 'Published'
                    ELSE 'Archived'
                END as status_text
            FROM siswa_posts sp
            JOIN profile p ON sp.profile_id = p.id
            LEFT JOIN post_images pi ON pi.siswapost_id = sp.id
            ORDER BY sp.created_at DESC
        `);

        // Process posts to include proper image paths
        const processedPosts = result.rows.map(post => {
            try {
                return {
                    ...post,
                    // Handle profile image path
                    profile_image: post.profile_image ? 
                        `http://localhost:5000/uploads/profiles/${post.profile_id}/${post.profile_image.split('/').pop()}` : 
                        null,
                    // Handle post images paths
                    images: post.images.map(img => {
                        try {
                            const filePath = img.file;
                            const pathParts = filePath.split('/');
                            const userId = pathParts[pathParts.indexOf('postSiswa') + 1];
                            const dateFolder = pathParts[pathParts.indexOf('postSiswa') + 2];
                            const fileName = path.basename(img.file);

                            return {
                                ...img,
                                file: `http://localhost:5000/uploads/postSiswa/${userId}/${dateFolder}/${fileName}`
                            };
                        } catch (err) {
                            console.error('Error processing image path:', err);
                            return {
                                ...img,
                                file: null
                            };
                        }
                    }).filter(img => img.file) // Remove any images with invalid paths
                };
            } catch (err) {
                console.error('Error processing post:', err);
                return null;
            }
        }).filter(post => post !== null); // Remove any posts that failed to process

        res.json(processedPosts);
    } catch (error) {
        console.error('Error fetching student posts:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching student posts' 
        });
    }
};

// Update post status (archive/restore)
const updatePostStatus = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { status } = req.body;

        // Update post status
        const result = await client.query(
            `UPDATE siswa_posts 
             SET status = $1,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, status`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await client.query('COMMIT');
        res.json({
            status: 'success',
            message: `Post ${status ? 'restored' : 'archived'} successfully`,
            data: result.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating post status:', error);
        res.status(500).json({ message: 'Error updating post status' });
    } finally {
        client.release();
    }
};

// Delete post permanently
const deletePostPermanently = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;

        // First, get the gallery ID
        const galleryResult = await client.query(
            'SELECT id FROM siswaglr WHERE siswapost_id = $1',
            [id]
        );

        if (galleryResult.rows.length > 0) {
            const galleryId = galleryResult.rows[0].id;

            // Delete photos
            await client.query(
                'DELETE FROM foto_siswa WHERE siswaglr_id = $1',
                [galleryId]
            );

            // Delete gallery
            await client.query(
                'DELETE FROM siswaglr WHERE id = $1',
                [galleryId]
            );
        }

        // Delete likes
        await client.query(
            'DELETE FROM siswa_post_likes WHERE siswapost_id = $1',
            [id]
        );

        // Finally delete the post
        const result = await client.query(
            'DELETE FROM siswa_posts WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await client.query('COMMIT');
        res.json({
            status: 'success',
            message: 'Post deleted permanently'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting post permanently:', error);
        res.status(500).json({ message: 'Error deleting post permanently' });
    } finally {
        client.release();
    }
};

module.exports = {
    getAllPosts,
    updatePostStatus,
    deletePostPermanently
}; 