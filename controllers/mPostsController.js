const pool = require('../config/database');

// Get posts for mobile app
const getMobilePosts = async (req, res) => {
    try {
        const result = await pool.query(`
            WITH post_galleries AS (
                SELECT 
                    g.post_id,
                    g.id as gallery_id,
                    json_agg(
                        json_build_object(
                            'id', f.id,
                            'file', CONCAT('gallery/', g.id, '/', f.file),
                            'judul', f.judul
                        ) ORDER BY f.id
                    ) as images
                FROM galery g
                JOIN foto f ON f.galery_id = g.id
                WHERE g.status = 0
                GROUP BY g.post_id, g.id
            )
            SELECT 
                p.id,
                p.judul,
                p.isi,
                p.created_at,
                p.status,
                k.judul as kategori_judul,
                k.id as kategori_id,
                COALESCE(
                    (
                        SELECT json_build_object(
                            'id', f2.id,
                            'file', CONCAT('gallery/', g2.id, '/', f2.file),
                            'judul', f2.judul
                        )
                        FROM galery g2
                        JOIN foto f2 ON f2.galery_id = g2.id
                        WHERE g2.post_id = p.id
                        AND g2.status = 0
                        ORDER BY f2.id
                        LIMIT 1
                    ),
                    NULL
                ) as thumbnail,
                COALESCE(pg.images, '[]'::json) as gallery_images
            FROM posts p
            LEFT JOIN kategori k ON p.kategori_id = k.id
            LEFT JOIN post_galleries pg ON pg.post_id = p.id
            WHERE p.status = 1
            ORDER BY p.created_at DESC
        `);

        const processedPosts = result.rows.map(post => ({
            id: post.id,
            judul: post.judul,
            isi: post.isi
                .replace(/<p class="ql-align-justify">/g, '<p>')
                .replace(/<p class="ql-align-center">/g, '<p>')
                .replace(/<p class="ql-align-right">/g, '<p>')
                .replace(/\s+/g, ' ')
                .trim(),
            created_at: post.created_at,
            kategori_judul: post.kategori_judul,
            kategori_id: post.kategori_id,
            thumbnail: post.thumbnail ? post.thumbnail.file : null,
            gallery_images: post.gallery_images.map(img => img.file)
        }));

        res.json(processedPosts);
    } catch (error) {
        console.error('Error fetching posts for mobile:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching posts',
            error: error.message 
        });
    }
};

// Get latest posts for mobile
const getLatestPosts = async (req, res) => {
    try {
        console.log('Fetching latest posts for mobile');
        const result = await pool.query(`
            WITH post_galleries AS (
                SELECT 
                    g.post_id,
                    g.id as gallery_id,
                    json_agg(
                        json_build_object(
                            'id', f.id,
                            'file', CONCAT('gallery/', g.id, '/', f.file),
                            'judul', f.judul
                        ) ORDER BY f.id
                    ) as images
                FROM galery g
                JOIN foto f ON f.galery_id = g.id
                WHERE g.status = 0
                GROUP BY g.post_id, g.id
            )
            SELECT 
                p.id,
                p.judul,
                p.isi,
                p.created_at,
                p.status,
                k.judul as kategori_judul,
                k.id as kategori_id,
                COALESCE(
                    (
                        SELECT json_build_object(
                            'id', f2.id,
                            'file', CONCAT('gallery/', g2.id, '/', f2.file),
                            'judul', f2.judul
                        )
                        FROM galery g2
                        JOIN foto f2 ON f2.galery_id = g2.id
                        WHERE g2.post_id = p.id
                        AND g2.status = 0
                        ORDER BY f2.id
                        LIMIT 1
                    ),
                    NULL
                ) as thumbnail,
                COALESCE(pg.images, '[]'::json) as gallery_images
            FROM posts p
            LEFT JOIN kategori k ON p.kategori_id = k.id
            LEFT JOIN post_galleries pg ON pg.post_id = p.id
            WHERE p.status = 1
            ORDER BY p.created_at DESC
            LIMIT 3
        `);

        console.log('Raw query result:', result.rows);

        const processedPosts = result.rows.map(post => ({
            id: post.id,
            judul: post.judul,
            isi: post.isi
                .replace(/<p class="ql-align-justify">/g, '<p>')
                .replace(/<p class="ql-align-center">/g, '<p>')
                .replace(/<p class="ql-align-right">/g, '<p>')
                .replace(/\s+/g, ' ')
                .trim(),
            created_at: post.created_at,
            kategori_judul: post.kategori_judul,
            kategori_id: post.kategori_id,
            thumbnail: post.thumbnail ? post.thumbnail.file : null,
            gallery_images: post.gallery_images.map(img => img.file)
        }));

        console.log('Processed posts:', processedPosts);
        res.json(processedPosts);
    } catch (error) {
        console.error('Error fetching latest posts:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching latest posts',
            error: error.message 
        });
    }
};

// Get post by ID for mobile
const getMobilePostById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            WITH post_galleries AS (
                SELECT 
                    g.post_id,
                    g.id as gallery_id,
                    json_agg(
                        json_build_object(
                            'id', f.id,
                            'file', CONCAT('gallery/', g.id, '/', f.file),
                            'judul', f.judul
                        ) ORDER BY f.id
                    ) as images
                FROM galery g
                JOIN foto f ON f.galery_id = g.id
                WHERE g.status = 0
                GROUP BY g.post_id, g.id
            )
            SELECT 
                p.id,
                p.judul,
                p.isi,
                p.created_at,
                p.status,
                k.judul as kategori_judul,
                k.id as kategori_id,
                COALESCE(pg.images, '[]'::json) as gallery_images
            FROM posts p
            LEFT JOIN kategori k ON p.kategori_id = k.id
            LEFT JOIN post_galleries pg ON pg.post_id = p.id
            WHERE p.id = $1 AND p.status = 1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const post = result.rows[0];
        const processedPost = {
            id: post.id,
            judul: post.judul,
            isi: post.isi
                .replace(/<p class="ql-align-justify">/g, '<p>')
                .replace(/<p class="ql-align-center">/g, '<p>')
                .replace(/<p class="ql-align-right">/g, '<p>')
                .replace(/\s+/g, ' ')
                .trim(),
            created_at: post.created_at,
            kategori_judul: post.kategori_judul,
            kategori_id: post.kategori_id,
            gallery_images: post.gallery_images.map(img => img.file)
        };

        res.json(processedPost);
    } catch (error) {
        console.error('Error fetching post by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching post',
            error: error.message
        });
    }
};

module.exports = {
    getMobilePosts,
    getLatestPosts,
    getMobilePostById
}; 