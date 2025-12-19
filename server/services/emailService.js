const { Resend } = require('resend');

// Initialize Resend with API Key
// NOTE: User must add RESEND_API_KEY to environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (toEmail, otp) => {
    try {
        console.log(`Attempting to send OTP email to ${toEmail} via Resend...`);
        
        const { data, error } = await resend.emails.send({
            from: 'PACT Admin <onboarding@resend.dev>', // Default testing domain. User should verify their own domain for production.
            to: [toEmail],
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
        });

        if (error) {
            console.error('Resend API Error:', error);
            return false;
        }

        console.log('OTP sent successfully via Resend. ID:', data.id);
        return true;
    } catch (err) {
        console.error('Error sending email with Resend:', err);
        return false;
    }
};

module.exports = { sendOTP };
