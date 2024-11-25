const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for post image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get current date for folder name
        const date = new Date();
        const dateFolder = `${date.getDate()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}`;
        
        // Create user-specific folder path without duplicate postSiswa
        const userFolder = path.join('uploads', 'postSiswa', req.user.id.toString(), dateFolder);
        
        // Create folders recursively if they don't exist
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }
        
        console.log('Created upload directory:', userFolder);
        cb(null, userFolder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'post-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

// Update multer configuration to handle both files and fields
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images only (jpeg, jpg, png)!');
        }
    }
}).fields([
    { name: 'images', maxCount: 10 },
    { name: 'caption', maxCount: 1 }
]);

// Create new post
const createPost = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            console.log('Request body:', req.body);
            console.log('Request files:', req.files);

            const caption = req.body.caption;
            const profile_id = req.user.id;

            // Validate caption
            if (!caption || typeof caption !== 'string' || caption.trim().length === 0) {
                throw new Error('Caption is required');
            }

            // Validate images
            if (!req.files || !req.files.images || req.files.images.length === 0) {
                throw new Error('At least one image is required');
            }

            console.log('Creating post with:', {
                profile_id,
                caption: caption.trim(),
                images_count: req.files.images.length
            });

            // Create post with status = true
            const postResult = await client.query(
                `INSERT INTO siswa_posts (profile_id, caption, status) 
                 VALUES ($1, $2, true) 
                 RETURNING id`,
                [profile_id, caption.trim()]
            );
            
            const post_id = postResult.rows[0].id;

            // Create gallery
            const galleryResult = await client.query(
                `INSERT INTO siswaglr (siswapost_id) 
                 VALUES ($1) 
                 RETURNING id`,
                [post_id]
            );
            
            const gallery_id = galleryResult.rows[0].id;

            // Save images with user-specific paths
            const imagePromises = req.files.images.map(async (file) => {
                // Get relative path from uploads directory
                const filePath = file.path.replace(/\\/g, '/'); // Convert backslashes to forward slashes
                const relativePath = filePath.split('uploads/')[1];
                
                console.log('Processing file:', {
                    originalPath: file.path,
                    normalizedPath: filePath,
                    relativePath: relativePath
                });

                if (!relativePath) {
                    throw new Error(`Invalid file path: ${file.path}`);
                }

                // Store the relative path in the database
                return client.query(
                    `INSERT INTO foto_siswa (siswaglr_id, file, judul) 
                     VALUES ($1, $2, $3)`,
                    [gallery_id, relativePath, file.originalname]
                );
            });

            await Promise.all(imagePromises);
            await client.query('COMMIT');

            console.log('Post created successfully:', {
                post_id,
                gallery_id,
                images: req.files.images.length
            });

            res.status(201).json({
                success: true,
                message: 'Post created successfully',
                post_id
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating post:', error);
            
            // Delete uploaded files if database operation fails
            if (req.files && req.files.images) {
                req.files.images.forEach(file => {
                    try {
                        fs.unlinkSync(file.path);
                        console.log(`Cleaned up file: ${file.path}`);
                    } catch (e) {
                        console.error(`Failed to clean up file: ${file.path}`, e);
                    }
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Error creating post'
            });
        } finally {
            client.release();
        }
    });
};

// Get posts by profile ID
const getPostsByProfile = async (req, res) => {
    try {
        const { profile_id } = req.params;
        
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
                p.profile_image,
                COALESCE(pi.images, '[]'::json) as images,
                EXISTS (
                    SELECT 1 
                    FROM siswa_post_likes spl 
                    WHERE spl.siswapost_id = sp.id 
                    AND spl.profile_id = COALESCE($2, -1)
                ) as is_liked
            FROM siswa_posts sp
            JOIN profile p ON sp.profile_id = p.id
            LEFT JOIN post_images pi ON pi.siswapost_id = sp.id
            WHERE sp.profile_id = $1 AND sp.status = true
            ORDER BY sp.created_at DESC
        `, [profile_id, req.user?.id || null]);

        // Process posts
        const processedPosts = result.rows.map(post => ({
            ...post,
            profile_image: post.profile_image ? 
                post.profile_image.replace(/^.*[\/\\]/, '') : null,
            images: post.images.map(img => ({
                ...img,
                file: img.file.split('/postSiswa/').pop()
            }))
        }));

        res.json({
            success: true,
            data: processedPosts
        });
    } catch (error) {
        console.error('Error fetching profile posts:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching profile posts'
        });
    }
};

// Get all posts
const getAllPosts = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const result = await client.query(`
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
            ),
            comment_counts AS (
                SELECT 
                    post_id,
                    COUNT(*)::integer as comments_count
                FROM siswa_post_comments
                WHERE status = true
                GROUP BY post_id
            )
            SELECT 
                sp.*,
                p.username,
                p.full_name,
                p.profile_image,
                COALESCE(pi.images, '[]'::json) as images,
                COALESCE(cc.comments_count, 0)::integer as comments_count,
                EXISTS (
                    SELECT 1 
                    FROM siswa_post_likes spl 
                    WHERE spl.siswapost_id = sp.id 
                    AND spl.profile_id = COALESCE($1, -1)
                ) as is_liked
            FROM siswa_posts sp
            JOIN profile p ON sp.profile_id = p.id
            LEFT JOIN post_images pi ON pi.siswapost_id = sp.id
            LEFT JOIN comment_counts cc ON cc.post_id = sp.id
            WHERE sp.status = true
            ORDER BY sp.created_at DESC
        `, [req.user?.id || null]);

        // Process posts with proper image paths
        const processedPosts = result.rows.map(post => {
            try {
                return {
                    ...post,
                    profile_image: post.profile_image ? 
                        post.profile_image.replace(/^.*[\/\\]/, '').trim() : null,
                    images: Array.isArray(post.images) ? 
                        post.images.map(img => ({
                            ...img,
                            file: img.file // Keep the path as stored in database
                        })).filter(img => img.file) : []
                };
            } catch (err) {
                console.error('Error processing post:', post.id, err);
                return null;
            }
        }).filter(post => post !== null);

        res.json({
            success: true,
            data: processedPosts,
            message: processedPosts.length ? 'Posts fetched successfully' : 'No posts found'
        });

    } catch (error) {
        console.error('Database error in getAllPosts:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error while fetching posts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Delete post
const deletePost = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { id: profile_id } = req.user;

        // Check if post exists and belongs to user
        const postResult = await client.query(
            'SELECT * FROM siswa_posts WHERE id = $1 AND profile_id = $2',
            [id, profile_id]
        );

        if (postResult.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Soft delete the post by setting status to false
        await client.query(
            'UPDATE siswa_posts SET status = false WHERE id = $1',
            [id]
        );

        await client.query('COMMIT');
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post' });
    } finally {
        client.release();
    }
};

// Like a post
const likePost = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { siswapost_id } = req.params;
        const { id: profile_id } = req.user;

        // Check if already liked
        const existingLike = await client.query(
            'SELECT id FROM siswa_post_likes WHERE siswapost_id = $1 AND profile_id = $2',
            [siswapost_id, profile_id]
        );

        if (existingLike.rows.length > 0) {
            // Unlike: Remove like and decrease count
            await client.query(
                'DELETE FROM siswa_post_likes WHERE siswapost_id = $1 AND profile_id = $2',
                [siswapost_id, profile_id]
            );
            
            await client.query(
                'UPDATE siswa_posts SET likes_count = likes_count - 1 WHERE id = $1',
                [siswapost_id]
            );

            await client.query('COMMIT');
            res.json({ liked: false });
        } else {
            // Like: Add like and increase count
            await client.query(
                'INSERT INTO siswa_post_likes (siswapost_id, profile_id) VALUES ($1, $2)',
                [siswapost_id, profile_id]
            );
            
            await client.query(
                'UPDATE siswa_posts SET likes_count = likes_count + 1 WHERE id = $1',
                [siswapost_id]
            );

            await client.query('COMMIT');
            res.json({ liked: true });
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error handling like:', error);
        res.status(500).json({ message: 'Error handling like' });
    } finally {
        client.release();
    }
};

// Check if user liked a post
const checkLike = async (req, res) => {
    try {
        const { siswapost_id } = req.params;
        const { id: profile_id } = req.user;

        const result = await pool.query(
            'SELECT id FROM siswa_post_likes WHERE siswapost_id = $1 AND profile_id = $2',
            [siswapost_id, profile_id]
        );

        res.json({ liked: result.rows.length > 0 });
    } catch (error) {
        console.error('Error checking like:', error);
        res.status(500).json({ message: 'Error checking like' });
    }
};

// Get like count for a post
const getLikeCount = async (req, res) => {
    try {
        const { siswapost_id } = req.params;
        
        const result = await pool.query(
            'SELECT likes_count FROM siswa_posts WHERE id = $1',
            [siswapost_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ count: result.rows[0].likes_count });
    } catch (error) {
        console.error('Error getting like count:', error);
        res.status(500).json({ message: 'Error getting like count' });
    }
};

// Add this new function
const getMainPagePosts = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
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
            ),
            comment_counts AS (
                SELECT 
                    post_id,
                    COUNT(*)::integer as comments_count
                FROM siswa_post_comments
                WHERE status = true
                GROUP BY post_id
            )
            SELECT 
                sp.*,
                p.username,
                p.full_name,
                p.profile_image,
                COALESCE(pi.images, '[]'::json) as images,
                COALESCE(cc.comments_count, 0)::integer as comments_count,
                EXISTS (
                    SELECT 1 
                    FROM siswa_post_likes spl 
                    WHERE spl.siswapost_id = sp.id 
                    AND spl.profile_id = COALESCE($1, -1)
                ) as is_liked
            FROM siswa_posts sp
            JOIN profile p ON sp.profile_id = p.id
            LEFT JOIN post_images pi ON pi.siswapost_id = sp.id
            LEFT JOIN comment_counts cc ON cc.post_id = sp.id
            WHERE sp.status = true AND p.main_page = true
            ORDER BY sp.created_at DESC
        `, [req.user?.id || null]);

        const processedPosts = result.rows.map(post => ({
            ...post,
            profile_image: post.profile_image ? 
                post.profile_image.replace(/^.*[\/\\]/, '') : null,
            images: post.images.map(img => ({
                ...img,
                file: img.file
            }))
        }));

        res.json({
            success: true,
            data: processedPosts
        });
    } catch (error) {
        console.error('Error fetching main page posts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching main page posts'
        });
    } finally {
        client.release();
    }
};

// Get comments for a post
const getPostComments = async (req, res) => {
    const client = await pool.connect();
    try {
        const { post_id } = req.params;
        const current_user_id = req.user?.id;
        
        const result = await client.query(`
            SELECT 
                c.*,
                p.full_name,
                p.profile_image,
                $2::integer as current_user_id
            FROM siswa_post_comments c
            JOIN profile p ON c.profile_id = p.id
            WHERE c.post_id = $1 AND c.status = true
            ORDER BY c.created_at DESC
        `, [post_id, current_user_id]);

        const comments = result.rows.map(comment => ({
            ...comment,
            profile_image: comment.profile_image ? 
                comment.profile_image.replace(/^.*[\/\\]/, '') : null
        }));

        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments'
        });
    } finally {
        client.release();
    }
};

// Create a new comment
const createPostComment = async (req, res) => {
    const client = await pool.connect();
    try {
        const { post_id } = req.params;
        const { content } = req.body;
        const profile_id = req.user.id;

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        // Create comment and get all necessary data in one query
        const result = await client.query(`
            WITH new_comment AS (
                INSERT INTO siswa_post_comments (post_id, profile_id, content)
                VALUES ($1, $2, $3)
                RETURNING *
            ),
            comment_data AS (
                SELECT 
                    nc.*,
                    p.full_name,
                    p.profile_image,
                    $2::integer as current_user_id
                FROM new_comment nc
                JOIN profile p ON nc.profile_id = p.id
            ),
            comment_count AS (
                SELECT COUNT(*)::integer as count
                FROM siswa_post_comments
                WHERE post_id = $1 AND status = true
            )
            SELECT 
                cd.*,
                cc.count as comments_count
            FROM comment_data cd
            CROSS JOIN comment_count cc
        `, [post_id, profile_id, content.trim()]);

        const commentData = {
            id: result.rows[0].id,
            post_id: parseInt(post_id),
            profile_id: result.rows[0].profile_id,
            content: result.rows[0].content,
            created_at: result.rows[0].created_at,
            full_name: result.rows[0].full_name,
            profile_image: result.rows[0].profile_image,
            current_user_id: result.rows[0].current_user_id,
            comments_count: result.rows[0].comments_count
        };

        res.status(201).json({
            success: true,
            data: commentData
        });

    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating comment'
        });
    } finally {
        client.release();
    }
};

// Delete a comment
const deletePostComment = async (req, res) => {
    const client = await pool.connect();
    try {
        const { post_id, comment_id } = req.params;
        const profile_id = req.user.id;

        // Soft delete by updating status
        const result = await client.query(`
            UPDATE siswa_post_comments
            SET status = false
            WHERE id = $1 AND post_id = $2 AND profile_id = $3
            RETURNING id
        `, [comment_id, post_id, profile_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found or unauthorized'
            });
        }

        // Get updated comment count
        const countResult = await client.query(`
            SELECT COUNT(*)::integer as count
            FROM siswa_post_comments
            WHERE post_id = $1 AND status = true
        `, [post_id]);

        const commentCount = countResult.rows[0].count;

        res.json({
            success: true,
            message: 'Comment deleted successfully',
            commentCount: commentCount
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment'
        });
    } finally {
        client.release();
    }
};

// Add this new function to get the latest comment
const getLatestComment = async (req, res) => {
    const client = await pool.connect();
    try {
        const { post_id } = req.params;
        const current_user_id = req.user?.id;
        
        const result = await client.query(`
            WITH latest_comment AS (
                SELECT 
                    c.*,
                    p.full_name,
                    p.profile_image,
                    $2::integer as current_user_id
                FROM siswa_post_comments c
                JOIN profile p ON c.profile_id = p.id
                WHERE c.post_id = $1 AND c.status = true
                ORDER BY c.created_at DESC
                LIMIT 1
            ),
            comment_count AS (
                SELECT COUNT(*)::integer as count
                FROM siswa_post_comments
                WHERE post_id = $1 AND status = true
            )
            SELECT 
                lc.*,
                cc.count as total_comments
            FROM latest_comment lc
            CROSS JOIN comment_count cc
        `, [post_id, current_user_id]);

        const response = {
            success: true,
            data: result.rows[0] ? {
                comment: {
                    ...result.rows[0],
                    profile_image: result.rows[0].profile_image ? 
                        result.rows[0].profile_image.replace(/^.*[\/\\]/, '') : null
                },
                totalComments: result.rows[0].total_comments
            } : {
                comment: null,
                totalComments: 0
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching latest comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching latest comment'
        });
    } finally {
        client.release();
    }
};

// Add this new function to get comment count
const getCommentCount = async (req, res) => {
    const client = await pool.connect();
    try {
        const { post_id } = req.params;
        
        const result = await client.query(`
            SELECT COUNT(*)::integer as count
            FROM siswa_post_comments
            WHERE post_id = $1 AND status = true
        `, [post_id]);

        res.json({
            success: true,
            count: result.rows[0].count
        });
    } catch (error) {
        console.error('Error getting comment count:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting comment count'
        });
    } finally {
        client.release();
    }
};

module.exports = {
    createPost,
    getPostsByProfile,
    getAllPosts,
    deletePost,
    likePost,
    checkLike,
    getLikeCount,
    getMainPagePosts,
    getPostComments,
    createPostComment,
    deletePostComment,
    getLatestComment,
    getCommentCount
}; 