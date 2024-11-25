require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add specific static middleware for profile images
app.use('/uploads/profiles', (req, res, next) => {
    const userId = req.path.split('/')[1]; // Get user ID from path
    const userProfileDir = path.join(__dirname, 'uploads', 'profiles', userId);
    
    console.log('Serving profile image:', {
        requestPath: req.path,
        userId: userId,
        fullPath: userProfileDir
    });
    
    express.static(userProfileDir)(req, res, next);
});

// Import routes
const postsRoutes = require('./routes/postsRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const authRoutes = require('./routes/authRoutes');
const agendaRoutes = require('./routes/agendaRoutes');
const webSettingsRoutes = require('./routes/webSettingsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const siswaPostsRoutes = require('./routes/siswaPostsRoutes');
const accountRoutes = require('./routes/accountRoutes');
const siswaPManagementRoutes = require('./routes/siswaPManagementRoutes');
const mAuthRoutes = require('./routes/mAuthRoutes');
const mPostsRoutes = require('./routes/mPostsRoutes');
const mAgendaRoutes = require('./routes/mAgendaRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Use routes
app.use('/api/posts', postsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/mobile/auth', mAuthRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/web-settings', webSettingsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/siswa-posts', siswaPostsRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/mobile-management', siswaPManagementRoutes);
app.use('/api/mobile/posts', mPostsRoutes);
app.use('/api/mobile/agenda', mAgendaRoutes);
app.use('/api/notifications', notificationRoutes);

// Add a test endpoint to check file paths
app.get('/check-file/*', (req, res) => {
    const filePath = req.params[0];
    const fullPath = path.join(__dirname, 'uploads', filePath);
    console.log('Checking file path:', fullPath);
    
    if (fs.existsSync(fullPath)) {
        res.json({ 
            exists: true, 
            path: fullPath,
            relativePath: filePath 
        });
    } else {
        res.status(404).json({ 
            exists: false, 
            path: fullPath,
            relativePath: filePath 
        });
    }
});

// Add this endpoint to test image access
app.get('/test-image/*', (req, res) => {
    const imagePath = req.params[0];
    const fullPath = path.join(__dirname, 'uploads', imagePath);
    console.log('Testing image access:', {
        requestedPath: imagePath,
        fullPath: fullPath,
        exists: fs.existsSync(fullPath)
    });
    
    if (fs.existsSync(fullPath)) {
        res.sendFile(fullPath);
    } else {
        res.status(404).json({
            error: 'Image not found',
            requestedPath: imagePath,
            fullPath: fullPath
        });
    }
});

// Add this before your routes
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Add this near the start of your file
const ensureDirectories = () => {
    const dirs = [
        path.join(__dirname, 'uploads'),
        path.join(__dirname, 'uploads', 'profiles'),
        path.join(__dirname, 'uploads', 'postSiswa')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log('Created directory:', dir);
        }
    });
};

// Call it when the server starts
ensureDirectories();