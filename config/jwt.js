require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'f0bdf7c5fe951e632ea788a874a78574b8ff100bb1c3e0a347041a98ae25dfb7c2e4986da917df5db6baf0d84c194085de195bba8441b33a61e0c383390bd5aa',
    expiresIn: '2h'
};