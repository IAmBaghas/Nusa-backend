require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'YOUR_JWT_SECRET',
    expiresIn: '2h'
};
