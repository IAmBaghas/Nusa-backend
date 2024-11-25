// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if OTP is expired
const isOTPExpired = (expiryTime) => {
    if (!expiryTime) return true;
    return new Date() > new Date(expiryTime);
};

// Set OTP expiry time (5 minutes from now)
const getOTPExpiry = () => {
    return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

module.exports = {
    generateOTP,
    isOTPExpired,
    getOTPExpiry
}; 