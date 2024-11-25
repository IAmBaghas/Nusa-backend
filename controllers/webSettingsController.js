const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for about images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/about');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `about-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (ext && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
    }
}).single('image');

// Add banner storage configuration
const bannerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/banner');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `banner-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const uploadBanner = multer({
    storage: bannerStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (ext && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
    }
}).single('image');

// Add logo storage configuration
const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/logo');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const uploadLogo = multer({
    storage: logoStorage,
    limits: { fileSize: 500 * 1024 }, // 500KB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (ext && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
    }
}).array('logos', 12); // Max 12 logos

// Add header storage configuration
const headerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/header');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `header-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const uploadHeader = multer({
    storage: headerStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (ext && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
    }
}).single('image');

// Get header settings
const getHeaderSettings = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT settings FROM web_settings WHERE component = $1',
            ['header']
        );

        const defaultSettings = {
            image: null,
            title: 'SEKOLAH NUSANTARA',
            subtitle: 'PUSAT KEUNGGULAN',
            backgroundColor: '#F6F6F6',
            titleColor: '#000000',
            subtitleColor: '#000000'
        };

        res.json(result.rows.length > 0 ? result.rows[0].settings : defaultSettings);
    } catch (error) {
        console.error('Error fetching header settings:', error);
        res.status(500).json({ message: 'Failed to fetch header settings' });
    }
};

// Get logo settings
const getLogoSettings = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT settings FROM web_settings WHERE component = $1',
            ['logos']
        );

        const defaultSettings = {
            logos: [],
            enabled: false
        };

        res.json(result.rows.length > 0 ? result.rows[0].settings : defaultSettings);
    } catch (error) {
        console.error('Error fetching logo settings:', error);
        res.status(500).json({ message: 'Failed to fetch logo settings' });
    }
};

// Get about settings
const getAboutSettings = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT settings FROM web_settings WHERE component = $1',
            ['about']
        );

        const defaultSettings = {
            name: '',
            title: '',
            description: '',
            image: null,
            vision: '',
            missions: []
        };

        res.json(result.rows.length > 0 ? result.rows[0].settings : defaultSettings);
    } catch (error) {
        console.error('Error fetching about settings:', error);
        res.status(500).json({ message: 'Failed to fetch about settings' });
    }
};

// Get footer settings
const getFooterSettings = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT settings FROM web_settings WHERE component = $1',
            ['footer']
        );

        const defaultSettings = {
            contact: {
                email: 'info@sekolahnusantara.sch.id',
                phone: {
                    number: '(0251) 123456',
                    hours: 'Senin - Jumat, 07:00 - 16:00 WIB'
                },
                fax: '(0251) 654321'
            },
            socialMedia: {
                instagram: '',
                youtube: '',
                linkedin: ''
            }
        };

        res.json(result.rows.length > 0 ? result.rows[0].settings : defaultSettings);
    } catch (error) {
        console.error('Error fetching footer settings:', error);
        res.status(500).json({ message: 'Failed to fetch footer settings' });
    }
};

// Get banner settings
const getBannerSettings = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT settings FROM web_settings WHERE component = $1',
            ['banner']
        );

        const defaultSettings = {
            image: null,
            text: {
                welcome: '',
                title: '',
                subtitle: ''
            }
        };

        res.json(result.rows.length > 0 ? result.rows[0].settings : defaultSettings);
    } catch (error) {
        console.error('Error fetching banner settings:', error);
        res.status(500).json({ message: 'Failed to fetch banner settings' });
    }
};

// Update settings for any component
const updateSettings = async (req, res) => {
    const client = await pool.connect();
    try {
        const { component } = req.params;
        const { settings } = req.body;

        if (!settings) {
            return res.status(400).json({
                status: 'error',
                message: 'Settings are required'
            });
        }

        const result = await client.query(`
            INSERT INTO web_settings (component, settings, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (component) 
            DO UPDATE SET 
                settings = $2,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id, component, settings, updated_at
        `, [component, settings]);

        res.json({
            status: 'success',
            message: 'Settings updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update settings'
        });
    } finally {
        client.release();
    }
};

// Add new method for handling about image uploads
const uploadAboutImage = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            res.json({
                message: 'File uploaded successfully',
                path: req.file.filename
            });
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
};

// Add banner image upload handler
const uploadBannerImage = async (req, res) => {
    try {
        uploadBanner(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            res.json({
                message: 'File uploaded successfully',
                path: req.file.filename
            });
        });
    } catch (error) {
        console.error('Error uploading banner:', error);
        res.status(500).json({ message: 'Error uploading banner' });
    }
};

// Add logo upload handler
const uploadLogoImages = async (req, res) => {
    try {
        uploadLogo(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: 'No files uploaded' });
            }

            const paths = req.files.map(file => file.filename);
            res.json({
                message: 'Files uploaded successfully',
                paths: paths
            });
        });
    } catch (error) {
        console.error('Error uploading logos:', error);
        res.status(500).json({ message: 'Error uploading logos' });
    }
};

// Add header upload handler
const uploadHeaderImage = async (req, res) => {
    try {
        uploadHeader(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            res.json({
                message: 'File uploaded successfully',
                path: req.file.filename
            });
        });
    } catch (error) {
        console.error('Error uploading header:', error);
        res.status(500).json({ message: 'Error uploading header' });
    }
};

module.exports = {
    getHeaderSettings,
    getLogoSettings,
    getAboutSettings,
    getFooterSettings,
    getBannerSettings,
    updateSettings,
    uploadAboutImage,
    uploadBannerImage,
    uploadLogoImages,
    uploadHeaderImage
}; 