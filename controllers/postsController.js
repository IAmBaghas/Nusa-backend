const pool = require('../config/database');

// Get posts for web display
const getWebPosts = async (req, res) => {
    try {
        const result = await pool.query(`
            WITH post_galleries AS (
                SELECT 
                    g.post_id,
                    g.id as gallery_id,
                    json_agg(
                        json_build_object(
                            'id', f.id,
                            'file', CONCAT('gallery/', g.id, '/', TRIM(BOTH '/' FROM f.file)),
                            'judul', f.judul
                        ) ORDER BY f.id
                    ) as images
                FROM galery g
                JOIN foto f ON f.galery_id = g.id
                WHERE g.status = 0
                GROUP BY g.post_id, g.id
            )
            SELECT 
                p.*,
                k.judul as kategori_judul,
                k.id as kategori_id,
                g.id as gallery_id,
                g.name as gallery_name,
                COALESCE(pg.images, '[]'::json) as gallery_images
            FROM posts p
            LEFT JOIN kategori k ON p.kategori_id = k.id
            LEFT JOIN galery g ON g.post_id = p.id
            LEFT JOIN post_galleries pg ON pg.post_id = p.id
            ORDER BY p.created_at DESC
        `);

        const processedPosts = result.rows.map(post => {
            let galleryImages = post.gallery_images || [];
            if (typeof galleryImages === 'string') {
                galleryImages = JSON.parse(galleryImages);
            }

            return {
                ...post,
                gallery_images: galleryImages,
                isi: post.isi
                    .replace(/<p class="ql-align-justify">/g, '<p>')
                    .replace(/<p class="ql-align-center">/g, '<p>')
                    .replace(/<p class="ql-align-right">/g, '<p>')
                    .replace(/\s+/g, ' ')
                    .trim()
            };
        });

        res.json(processedPosts);
    } catch (error) {
        console.error('Error fetching web posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch posts',
            error: error.message
        });
    }
};

// Get posts for admin management
const getAdminPosts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.*,
                g.name as gallery_name,
                json_agg(
                    json_build_object(
                        'id', f.id,
                        'file', f.file,
                        'judul', f.judul
                    )
                ) FILTER (WHERE f.id IS NOT NULL) as gallery_images,
                k.judul as kategori_nama
            FROM posts p
            LEFT JOIN galery g ON g.post_id = p.id
            LEFT JOIN foto f ON f.galery_id = g.id
            LEFT JOIN kategori k ON k.id = p.kategori_id
            GROUP BY p.id, g.name, k.judul
            ORDER BY p.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching admin posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch posts'
        });
    }
};

// Get single post by ID
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                p.*,
                g.name as gallery_name,
                json_agg(
                    json_build_object(
                        'id', f.id,
                        'file', f.file,
                        'judul', f.judul
                    )
                ) FILTER (WHERE f.id IS NOT NULL) as gallery_images,
                k.judul as kategori_nama
            FROM posts p
            LEFT JOIN galery g ON g.post_id = p.id
            LEFT JOIN foto f ON f.galery_id = g.id
            LEFT JOIN kategori k ON k.id = p.kategori_id
            WHERE p.id = $1
            GROUP BY p.id, g.name, k.judul
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch post'
        });
    }
};

// Get available galleries (not assigned to any post)
const getAvailableGalleries = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                g.id,
                g.name
            FROM galery g
            WHERE g.post_id IS NULL
            ORDER BY g.id DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching available galleries:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch available galleries',
            error: error.message
        });
    }
};

// Create post
const createPost = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { judul, kategori_id, isi, gallery_id, status = 0 } = req.body;

        // Validate required fields
        if (!judul || !kategori_id || !isi || !gallery_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        await client.query('BEGIN');

        // Check if gallery is available
        const galleryCheck = await client.query(
            'SELECT id FROM galery WHERE id = $1 AND post_id IS NULL',
            [gallery_id]
        );

        if (galleryCheck.rows.length === 0) {
            throw new Error('Selected gallery is not available');
        }

        // Create the post without updated_at
        const postResult = await client.query(`
            INSERT INTO posts (
                judul, 
                kategori_id, 
                isi, 
                status, 
                created_at
            )
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING *
        `, [judul, kategori_id, isi, status]);

        const newPost = postResult.rows[0];

        // Update the gallery with the new post_id
        await client.query(`
            UPDATE galery 
            SET 
                post_id = $1,
                status = 0
            WHERE id = $2
        `, [newPost.id, gallery_id]);

        await client.query('COMMIT');

        // Get the complete post data with gallery
        const completePost = await client.query(`
            SELECT 
                p.*,
                g.name as gallery_name,
                json_agg(
                    json_build_object(
                        'id', f.id,
                        'file', f.file,
                        'judul', f.judul
                    )
                ) as gallery_images
            FROM posts p
            LEFT JOIN galery g ON g.post_id = p.id
            LEFT JOIN foto f ON f.galery_id = g.id
            WHERE p.id = $1
            GROUP BY p.id, g.name
        `, [newPost.id]);

        res.status(201).json({
            status: 'success',
            message: 'Post created successfully',
            data: completePost.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating post:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to create post'
        });
    } finally {
        client.release();
    }
};

// Update post
const updatePost = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { judul, kategori_id, isi, status } = req.body;

        await client.query('BEGIN');

        // Update post
        const result = await client.query(`
            UPDATE posts 
            SET 
                judul = $1,
                kategori_id = $2,
                isi = $3,
                status = $4
            WHERE id = $5
            RETURNING *
        `, [judul, kategori_id, isi, status, id]);

        await client.query('COMMIT');

        res.json({
            status: 'success',
            message: 'Post updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update post'
        });
    } finally {
        client.release();
    }
};

// Delete post
const deletePost = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        await client.query('BEGIN');

        // First, update the gallery to remove post_id
        await client.query(`
            UPDATE galery 
            SET post_id = NULL, status = 0 
            WHERE post_id = $1
        `, [id]);

        // Then delete the post
        const result = await client.query(
            'DELETE FROM posts WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            throw new Error('Post not found');
        }

        await client.query('COMMIT');

        res.json({
            status: 'success',
            message: 'Post deleted successfully'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete post'
        });
    } finally {
        client.release();
    }
};

// Add this test endpoint
const testEndpoint = async (req, res) => {
    res.json({ message: 'Posts API is working!' });
};

const postsController = {
    getWebPosts,
    getAdminPosts,
    getPostById,
    getAvailableGalleries,
    createPost,
    updatePost,
    deletePost,
    testEndpoint,
};

module.exports = postsController; 