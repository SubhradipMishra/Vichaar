import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Ensure env vars are loaded from the correct path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getTransporter = () => {
    console.log('Attempting to create transporter with:', process.env.SMTP_EMAIL);
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASS) {
        throw new Error('SMTP credentials are missing in .env file');
    }
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS,
        },
    });
};

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        const mailOptions = {
            from: `"Vichaar" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await getTransporter().sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendOTPEmail = async (to: string, otp: string) => {
    const subject = `${otp} is your Vichaar verification code`;
    const text = `Your OTP for Vichaar is: ${otp}. It will expire in 10 minutes.`;
    const html = `
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <!-- Header with Gradient -->
                <div style="background: linear-gradient(135deg, #6241fe 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
                    <div style="display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 18px; line-height: 60px; color: white; font-size: 28px; font-weight: 900; border: 1px solid rgba(255,255,255,0.3);">V</div>
                    <h1 style="color: white; margin: 15px 0 0 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Vichaar</h1>
                    <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 5px; font-weight: 500;">Think Deeper. Write Smarter.</p>
                </div>

                <!-- Body -->
                <div style="padding: 40px; text-align: center;">
                    <h2 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 10px;">Verify Your Identity</h2>
                    <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        Thanks for choosing Vichaar! Please use the following one-time password to securely verify your email address and start your journey.
                    </p>

                    <!-- OTP Card -->
                    <div style="background: #f1f5f9; padding: 30px; border-radius: 20px; display: inline-block; min-width: 250px; border: 2px solid #e2e8f0;">
                        <span style="display: block; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Your Verification Code</span>
                        <div style="font-size: 48px; font-weight: 900; color: #6241fe; letter-spacing: 8px; margin: 0;">${otp}</div>
                    </div>

                    <p style="color: #94a3b8; font-size: 13px; margin-top: 25px;">
                        This code is active for <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this message.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #f1f5f9;">
                    <div style="margin-bottom: 20px;">
                        <a href="#" style="display: inline-block; margin: 0 12px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="20" height="20" alt="Twitter"></a>
                        <a href="#" style="display: inline-block; margin: 0 12px;"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png" width="20" height="20" alt="Discord"></a>
                        <a href="#" style="display: inline-block; margin: 0 12px;"><img src="https://cdn-icons-png.flaticon.com/512/5968/5968830.png" width="20" height="20" alt="Medium"></a>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 Vichaar AI Platform. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;
    return sendEmail(to, subject, text, html);
};

export const sendForgotPasswordEmail = async (to: string, otp: string) => {
    const subject = `Reset your Vichaar password - ${otp}`;
    const text = `Your password reset code for Vichaar is: ${otp}. It will expire in 10 minutes.`;
    const html = `
        <div style="background-color: #fff1f2; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(225,29,72,0.05); border: 1px solid #ffe4e6;">
                <!-- Header with Vibrant Rose Gradient -->
                <div style="background: linear-gradient(135deg, #e11d48 0%, #fb7185 100%); padding: 40px 20px; text-align: center;">
                    <div style="display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 18px; line-height: 60px; color: white; font-size: 28px; font-weight: 900; border: 1px solid rgba(255,255,255,0.3);">V</div>
                    <h1 style="color: white; margin: 15px 0 0 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Vichaar</h1>
                    <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 5px; font-weight: 500;">Account Recovery</p>
                </div>

                <!-- Body -->
                <div style="padding: 40px; text-align: center;">
                    <div style="background: #fff1f2; color: #e11d48; display: inline-block; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 800; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Security Alert</div>
                    <h2 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 10px;">Reset Your Password</h2>
                    <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        We received a request to reset your password. Use the specialized code below to gain access to your account again.
                    </p>

                    <!-- OTP Card -->
                    <div style="background: #fff1f2; padding: 30px; border-radius: 20px; display: inline-block; min-width: 250px; border: 2px solid #ffe4e6;">
                        <span style="display: block; font-size: 12px; font-weight: 700; color: #fb7185; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Security Reset Code</span>
                        <div style="font-size: 48px; font-weight: 900; color: #e11d48; letter-spacing: 8px; margin: 0;">${otp}</div>
                    </div>

                    <div style="margin-top: 30px; background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: left;">
                        <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.5;">
                            <strong>Didn't ask for this?</strong> If you didn't request a password reset, please ignore this email or <a href="#" style="color: #e11d48; font-weight: 700; text-decoration: none;">contact support</a> if you're concerned about your account security.
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background: #fff1f2; padding: 30px; text-align: center; border-top: 1px solid #ffe4e6;">
                    <p style="color: #fb7185; font-size: 12px; margin: 0;">This is a secure automated message from Vichaar.</p>
                    <p style="color: #94a3b8; font-size: 11px; margin-top: 5px;">&copy; 2026 Vichaar AI Platform. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;
    return sendEmail(to, subject, text, html);
};
