const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendOTP = async (email, otp) => {
    console.log('Attempting to send OTP to:', email);

    const mailOptions = {
        from: `Sekolah Nusantara <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Login OTP - Sekolah Nusantara',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Login Verification</h2>
                <p>Your OTP code for login is:</p>
                <h1 style="font-size: 32px; letter-spacing: 5px; color: #4338ca;">${otp}</h1>
                <p>This code will expire in 5 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendOTP }; 