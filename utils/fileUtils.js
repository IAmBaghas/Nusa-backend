const path = require('path');
const fs = require('fs');

const cleanFilePath = (filePath) => {
    if (!filePath) return null;
    // Remove any 'uploads/' prefix and normalize slashes
    return filePath.replace(/^uploads[\/\\]/, '').replace(/\\/g, '/');
};

const getFullFilePath = (relativePath) => {
    if (!relativePath) return null;
    return path.join(__dirname, '..', 'uploads', cleanFilePath(relativePath));
};

const fileExists = (relativePath) => {
    if (!relativePath) return false;
    const fullPath = getFullFilePath(relativePath);
    return fs.existsSync(fullPath);
};

module.exports = {
    cleanFilePath,
    getFullFilePath,
    fileExists
}; 