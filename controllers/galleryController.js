const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const baseDir = path.join(__dirname, '../uploads/temp');
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }
        cb(null, baseDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `gallery-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Get all galleries with their images
const getGalleries = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                g.id,
                g.name as judul,
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', f.id,
                            'file', f.file,
                            'judul', f.judul
                        )
                    )
                    FROM foto f 
                    WHERE f.galery_id = g.id
                ) as photos,
                (
                    SELECT file 
                    FROM foto 
                    WHERE galery_id = g.id 
                    ORDER BY id DESC 
                    LIMIT 1
                ) as preview_image,
                COUNT(f.id) as photo_count
            FROM galery g
            LEFT JOIN foto f ON g.id = f.galery_id
            GROUP BY g.id, g.name
            ORDER BY g.id DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching galleries:', error);
        res.status(500).json({ message: 'Error fetching galleries' });
    }
};

// Create new gallery
const createGallery = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create gallery
        const galleryResult = await client.query(
            'INSERT INTO galery (name, post_id, position, status) VALUES ($1, NULL, 1, 0) RETURNING *',
            [req.body.name]
        );
        const gallery = galleryResult.rows[0];

        // Create gallery directory
        const galleryDir = path.join(__dirname, '../uploads/gallery', gallery.id.toString());
        if (!fs.existsSync(galleryDir)) {
            fs.mkdirSync(galleryDir, { recursive: true });
        }

        // Process uploaded files
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    // Move file from temp to gallery directory
                    const newPath = path.join(galleryDir, file.filename);
                    fs.renameSync(file.path, newPath);

                    // Save to database
                    await client.query(
                        'INSERT INTO foto (galery_id, file, judul) VALUES ($1, $2, $3)',
                        [gallery.id, file.filename, file.originalname]
                    );
                } catch (fileError) {
                    console.error('Error processing file:', fileError);
                }
            }
        }

        await client.query('COMMIT');

        // Return gallery with images
        const result = await client.query(`
            SELECT 
                g.id,
                g.name,
                COALESCE(json_agg(
                    json_build_object(
                        'id', f.id, 
                        'file', f.file,
                        'judul', f.judul
                    )
                ) FILTER (WHERE f.id IS NOT NULL), '[]') AS images
            FROM galery g
            LEFT JOIN foto f ON g.id = f.galery_id
            WHERE g.id = $1
            GROUP BY g.id
        `, [gallery.id]);

        res.status(201).json(result.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        // Clean up any uploaded files
        if (req.files) {
            req.files.forEach(file => {
                try {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            });
        }
        console.error('Error creating gallery:', error);
        res.status(400).json({ 
            message: error.message || 'Error creating gallery'
        });
    } finally {
        client.release();
    }
};

// Update gallery name
const updateGallery = async (req, res) => {
    const { id } = req.params;
    const { judul } = req.body;

    try {
        const result = await pool.query(
            'UPDATE galery SET name = $1 WHERE id = $2 RETURNING *',
            [judul, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Gallery not found' });
        }

        res.json({
            ...result.rows[0],
            judul: result.rows[0].name
        });
    } catch (error) {
        console.error('Error updating gallery:', error);
        res.status(500).json({ message: 'Error updating gallery' });
    }
};

// Add images to existing gallery
const addImagesToGallery = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if gallery exists
        const galleryCheck = await client.query(
            'SELECT id, name FROM galery WHERE id = $1',
            [id]
        );

        if (galleryCheck.rows.length === 0) {
            throw new Error('Gallery not found');
        }

        const gallery = galleryCheck.rows[0];
        const galleryDir = path.join(__dirname, '../uploads/gallery', gallery.id.toString());
        
        // Ensure gallery directory exists
        if (!fs.existsSync(galleryDir)) {
            fs.mkdirSync(galleryDir, { recursive: true });
        }

        // Process uploaded files
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    // Move file to gallery directory
                    const newPath = path.join(galleryDir, file.filename);
                    fs.renameSync(file.path, newPath);

                    // Save to database
                    await client.query(
                        'INSERT INTO foto (galery_id, file, judul) VALUES ($1, $2, $3)',
                        [gallery.id, file.filename, file.originalname]
                    );
                } catch (fileError) {
                    console.error('Error processing file:', fileError);
                    throw fileError;
                }
            }
        }

        await client.query('COMMIT');

        // Return updated gallery with images
        const result = await client.query(`
            SELECT 
                g.id,
                g.name,
                COALESCE(json_agg(
                    json_build_object(
                        'id', f.id, 
                        'file', f.file,
                        'judul', f.judul
                    )
                ) FILTER (WHERE f.id IS NOT NULL), '[]') AS images
            FROM galery g
            LEFT JOIN foto f ON g.id = f.galery_id
            WHERE g.id = $1
            GROUP BY g.id
        `, [gallery.id]);

        res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        // Clean up any uploaded files
        if (req.files) {
            req.files.forEach(file => {
                try {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            });
        }
        console.error('Error adding images:', error);
        res.status(400).json({ 
            message: error.message || 'Error adding images to gallery'
        });
    } finally {
        client.release();
    }
};

// Delete gallery
const deleteGallery = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('BEGIN');

        // Delete associated images first
        await pool.query('DELETE FROM foto WHERE galery_id = $1', [id]);

        // Then delete the gallery
        const result = await pool.query(
            'DELETE FROM galery WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Gallery not found' });
        }

        await pool.query('COMMIT');
        res.json({ message: 'Gallery deleted successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error deleting gallery:', error);
        res.status(500).json({ message: 'Error deleting gallery' });
    }
};

// Delete image
const deleteImage = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM foto WHERE id = $1 RETURNING id, galery_id, file',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Delete the actual file
        const deletedImage = result.rows[0];
        const imagePath = path.join(__dirname, '../uploads/gallery', 
            deletedImage.galery_id.toString(), deletedImage.file);
        
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        res.json({ 
            message: 'Image deleted successfully',
            deletedImage: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Error deleting image' });
    }
};

// Add this new function to update gallery title
const updateGalleryTitle = async (req, res) => {
    const { id } = req.params;
    const { judul } = req.body;

    try {
        const result = await pool.query(
            'UPDATE galery SET name = $1 WHERE id = $2 RETURNING *',
            [judul, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Gallery not found' });
        }

        res.json({
            ...result.rows[0],
            judul: result.rows[0].name
        });
    } catch (error) {
        console.error('Error updating gallery title:', error);
        res.status(500).json({ message: 'Error updating gallery title' });
    }
};

// Update the getGalleryStats function
const getGalleryStats = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM galery) as total_galleries,
                (SELECT COUNT(*) FROM foto) as total_all_photos,
                (SELECT COUNT(f.id) 
                 FROM foto f 
                 INNER JOIN galery g ON f.galery_id = g.id) as total_gallery_photos,
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', g.id,
                            'name', g.name,
                            'photo_count', (
                                SELECT COUNT(*) 
                                FROM foto f 
                                WHERE f.galery_id = g.id
                            )
                        )
                    )
                    FROM (
                        SELECT * FROM galery 
                        ORDER BY id DESC 
                        LIMIT 5
                    ) g
                ) as recent_galleries
        `);

        // Convert the counts to numbers and send response
        const stats = {
            totalGalleries: parseInt(result.rows[0].total_galleries),
            totalAllPhotos: parseInt(result.rows[0].total_all_photos),
            totalGalleryPhotos: parseInt(result.rows[0].total_gallery_photos),
            recentGalleries: result.rows[0].recent_galleries || []
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching gallery stats:', error);
        res.status(500).json({ message: 'Error fetching gallery stats' });
    }
};

module.exports = {
    getGalleries,
    createGallery,
    updateGallery,
    addImagesToGallery,
    deleteGallery,
    deleteImage,
    upload,
    updateGalleryTitle,
    getGalleryStats
}; 