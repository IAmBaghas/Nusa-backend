const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'No token provided' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token has expired
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
            return res.status(403).json({
                success: false,
                message: 'Token has expired'
            });
        }

        req.user = decoded;

        // Route type validation
        const isMobileAuthRoute = req.baseUrl.includes('/api/mobile/auth');
        const isWebAuthRoute = req.baseUrl.includes('/api/auth');
        const isMobileManagementRoute = req.baseUrl.includes('/api/mobile-management');

        if (isMobileAuthRoute && decoded.type === 'web_admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Invalid access type for mobile route' 
            });
        }

        if (isWebAuthRoute && decoded.type !== 'web_admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Invalid access type for web route' 
            });
        }

        if (isMobileManagementRoute && decoded.type !== 'web_admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Admin access required for management' 
            });
        }

        req.userType = decoded.type || 'mobile_user';
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(403).json({ 
            success: false,
            message: 'Invalid or expired token',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = {
    authenticateToken,
    requireWebAdmin: (req, res, next) => {
        if (req.user?.type !== 'web_admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Admin access required' 
            });
        }
        next();
    },
    requireMobileUser: (req, res, next) => {
        if (req.user?.type === 'web_admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Mobile user access required' 
            });
        }
        next();
    }
};