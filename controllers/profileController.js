const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create user-specific profile image directory
        const userProfileDir = path.join('uploads', 'profiles', req.user.id.toString());
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(userProfileDir)) {
            fs.mkdirSync(userProfileDir, { recursive: true });
        }
        
        console.log('Created profile directory:', userProfileDir);
        cb(null, userProfileDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'profile-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    // Log file information
    console.log('Uploaded file:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });

    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed types: ${allowedMimes.join(', ')}`));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
}).single('profile_image');

// Update profile image
const updateProfileImage = async (req, res) => {
    upload(req, res, async (err) => {
        console.log('Update profile image request:', {
            userId: req.user.id,
            headers: req.headers,
            files: req.files,
            file: req.file,
            body: req.body
        });

        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ 
                message: 'File upload error',
                error: err.message 
            });
        } else if (err) {
            console.error('Other upload error:', err);
            return res.status(400).json({ 
                message: err.message || 'Unknown upload error'
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                message: 'No file uploaded' 
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { id } = req.user;
            
            // Get current profile image
            const currentResult = await client.query(
                'SELECT profile_image FROM profile WHERE id = $1',
                [id]
            );

            const currentImage = currentResult.rows[0]?.profile_image;

            // Delete old profile image if exists
            if (currentImage) {
                const oldImagePath = path.join(__dirname, '..', currentImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Get relative path from uploads directory
            const filePath = req.file.path.replace(/\\/g, '/'); // Convert backslashes to forward slashes
            const relativePath = filePath.split('uploads/')[1];

            // Update profile with new image
            await client.query(
                'UPDATE profile SET profile_image = $1 WHERE id = $2',
                [relativePath, id]
            );

            await client.query('COMMIT');

            console.log('Profile image updated successfully:', {
                userId: id,
                newImagePath: relativePath
            });

            res.json({ 
                message: 'Profile image updated successfully',
                profile_image: relativePath
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Database error:', error);
            // Delete uploaded file if database update fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ 
                message: 'Error updating profile image',
                error: error.message 
            });
        } finally {
            client.release();
        }
    });
};

// Delete profile image
const deleteProfileImage = async (req, res) => {
    try {
        const { id } = req.user;

        // Get current profile image
        const result = await pool.query(
            'SELECT profile_image FROM profile WHERE id = $1',
            [id]
        );

        const currentImage = result.rows[0]?.profile_image;

        // Delete image file if exists
        if (currentImage) {
            const imagePath = path.join(__dirname, '..', currentImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Update profile to remove image reference
        await pool.query(
            'UPDATE profile SET profile_image = NULL WHERE id = $1',
            [id]
        );

        res.json({ message: 'Profile image deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile image:', error);
        res.status(500).json({ message: 'Error deleting profile image' });
    }
};

// Add search users endpoint
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const result = await pool.query(
            `SELECT id, username, full_name, email, profile_image 
             FROM profile 
             WHERE LOWER(full_name) LIKE LOWER($1) 
             OR LOWER(username) LIKE LOWER($1) 
             LIMIT 10`,
            [`%${q}%`]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Error searching users' });
    }
};

module.exports = {
    updateProfileImage,
    deleteProfileImage,
    searchUsers
}; 