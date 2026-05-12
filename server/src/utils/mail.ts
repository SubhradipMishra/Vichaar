import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Ensure env vars are loaded from the correct path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getTransporter = () => {
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
            from: `"Vichaar CMS" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await getTransporter().sendMail(mailOptions);
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
                <div style="background: linear-gradient(135deg, #6241fe 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
                    <div style="display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 18px; line-height: 60px; color: white; font-size: 28px; font-weight: 900; border: 1px solid rgba(255,255,255,0.3);">V</div>
                    <h1 style="color: white; margin: 15px 0 0 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Vichaar</h1>
                </div>
                <div style="padding: 40px; text-align: center;">
                    <h2 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 10px;">Verify Your Identity</h2>
                    <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        Thanks for choosing Vichaar! Please use the following one-time password to securely verify your email address.
                    </p>
                    <div style="background: #f1f5f9; padding: 30px; border-radius: 20px; display: inline-block; min-width: 250px; border: 2px solid #e2e8f0;">
                        <span style="display: block; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Your Verification Code</span>
                        <div style="font-size: 48px; font-weight: 900; color: #6241fe; letter-spacing: 8px; margin: 0;">${otp}</div>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; margin-top: 25px;">
                        This code is active for 10 minutes.
                    </p>
                </div>
                <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px;">
                    &copy; 2026 Vichaar AI Platform.
                </div>
            </div>
        </div>
    `;
    return sendEmail(to, subject, text, html);
};

export const sendForgotPasswordEmail = async (to: string, otp: string) => {
    const subject = `Reset your Vichaar password`;
    const text = `Use code ${otp} to reset your password.`;
    const html = `
        <div style="background-color: #fff5f5; padding: 40px 20px; font-family: sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #fee2e2;">
                <h2 style="color: #991b1b;">Password Reset Request</h2>
                <p style="color: #4b5563;">You requested a password reset. Use the code below to proceed:</p>
                <div style="font-size: 32px; font-weight: 900; color: #dc2626; letter-spacing: 5px; margin: 20px 0;">${otp}</div>
                <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, you can ignore this email.</p>
            </div>
        </div>
    `;
    return sendEmail(to, subject, text, html);
};

export const sendPostStatusEmail = async (userEmail: string, userName: string, postTitle: string, status: string, feedback?: string) => {
    const statusConfig: any = {
        pending: { label: 'Under Review', color: '#6241fe', icon: '📡', message: 'Your post is in the queue for review.' },
        published: { label: 'Live & Published', color: '#10b981', icon: '🚀', message: 'Congratulations! Your post is now live.' },
        rejected: { label: 'Action Required', color: '#ef4444', icon: '⚠️', message: 'Your post requires changes before publishing.' },
        draft: { label: 'Saved as Draft', color: '#64748b', icon: '📝', message: 'Your draft has been saved.' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    const userHtml = `
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0;">
                <div style="background: ${config.color}; padding: 30px; text-align: center; color: white;">
                    <div style="font-size: 40px;">${config.icon}</div>
                    <h2 style="margin: 10px 0 0 0;">${config.label}</h2>
                </div>
                <div style="padding: 40px;">
                    <p>Hi <strong>${userName}</strong>,</p>
                    <p>Update on your post: <strong>"${postTitle}"</strong></p>
                    <p>${config.message}</p>
                    ${feedback ? `<div style="padding: 15px; background: #fff1f2; border-left: 4px solid #ef4444; margin: 20px 0;"><strong>Feedback:</strong> ${feedback}</div>` : ''}
                    <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #6241fe; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Open Dashboard</a>
                </div>
            </div>
        </div>
    `;

    // Send to User
    await sendEmail(userEmail, `Post Update: ${postTitle}`, `Your post is now ${config.label}`, userHtml);

    // Send notification to Admin
    const adminHtml = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">Admin Notification: Post Status Changed</h2>
            <p><strong>Post:</strong> ${postTitle}</p>
            <p><strong>Author:</strong> ${userName} (${userEmail})</p>
            <p><strong>New Status:</strong> <span style="color: ${config.color}; font-weight: bold; text-transform: uppercase;">${status}</span></p>
            ${feedback ? `<p><strong>Feedback Provided:</strong> ${feedback}</p>` : ''}
            <p>Action taken at: ${new Date().toLocaleString()}</p>
            <hr>
            <a href="${process.env.FRONTEND_URL}/dashboard" style="color: #6241fe; font-weight: bold;">Open Admin Dashboard</a>
        </div>
    `;

    await sendEmail(process.env.SMTP_EMAIL!, `[ADMIN] Post Status Update: ${postTitle}`, `Status: ${status}`, adminHtml);
};
