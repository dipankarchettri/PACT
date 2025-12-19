const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    // Fix for ETIMEDOUT: Force IPv4 and set explicit timeouts
    logger: true,
    debug: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});

const sendOTP = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: `"PACT Admin" <${process.env.GMAIL_USER}>`,
            to: toEmail,
            subject: 'PACT Profile Update Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4f46e5;">PACT Identity Verification</h2>
                    <p>You requested to update your profile information.</p>
                    <p>Please use the following OTP to verify your identity:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #111827; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Add IPv4 requirement to avoiding ipv6 timeouts on some cloud providers
transporter.verify(function (error, success) {
    if (error) {
        console.log('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});
};

module.exports = { sendOTP };
