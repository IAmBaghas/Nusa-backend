const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

const getAllPosts = async (req, res) => {
    try {
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
                sp.*,
                p.username,
                p.full_name,
                p.id as profile_id,
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

        const processedPosts = result.rows.map(post => ({
            ...post,
            profile_image: post.profile_image,
            images: post.images.map(img => ({
                ...img,
                file: `http://localhost:5000/uploads/${img.file}`
            }))
        }));

        res.json(processedPosts);
    } catch (error) {
        console.error('Error fetching student posts:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching student posts',
            error: error.message 
        });
    }
};

const updatePostStatus = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { status } = req.body;

        const result = await client.query(
            `UPDATE siswa_posts 
             SET status = $1,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
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

const deletePostPermanently = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;

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