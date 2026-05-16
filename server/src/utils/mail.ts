import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Ensure env vars are loaded from the correct path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        if (!process.env.BREVO_EMAIL || !process.env.BREVO_API_KEY) {
            throw new Error('Brevo API credentials are missing in .env file');
        }

        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: 'Vichaar CMS',
                    email: process.env.BREVO_EMAIL,
                },
                to: [{ email: to }],
                subject,
                textContent: text,
                htmlContent: html || text,
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error sending email via Brevo API:', error.response?.data || error.message);
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

export const sendPostStatusEmail = async (userEmail: string, userName: string, postTitle: string, status: string, feedback?: string, adminEmails?: string[]) => {
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

    // Recipient list for admins
    const recipients = adminEmails && adminEmails.length > 0
        ? adminEmails.join(', ')
        : (process.env.SUPPORT_EMAIL || process.env.BREVO_EMAIL!);

    await sendEmail(recipients, `[ADMIN] Post Status Update: ${postTitle}`, `Status: ${status}`, adminHtml);
};

export const sendAuthorInteractionEmail = async (authorEmail: string, authorName: string, interacteeName: string, postTitle: string, type: 'like' | 'dislike' | 'comment' | 'reply', content?: string) => {
    const config: any = {
        like: { label: 'Liked your post', color: '#6241fe', icon: '❤️' },
        dislike: { label: 'Disliked your post', color: '#ef4444', icon: '👎' },
        comment: { label: 'Commented on your post', color: '#8b5cf6', icon: '💬' },
        reply: { label: 'Replied to your comment', color: '#ec4899', icon: '↩️' }
    };

    const details = config[type];
    const subject = `${interacteeName} ${details.label}: ${postTitle}`;

    const html = `
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                <div style="background: ${details.color}; padding: 30px; text-align: center; color: white;">
                    <div style="font-size: 40px;">${details.icon}</div>
                    <h2 style="margin: 10px 0 0 0;">New Interaction</h2>
                </div>
                <div style="padding: 40px;">
                    <p>Hi <strong>${authorName}</strong>,</p>
                    <p><strong>${interacteeName}</strong> has just ${details.label.toLowerCase()} <strong>"${postTitle}"</strong>.</p>
                    ${content ? `<div style="padding: 15px; background: #f1f5f9; border-radius: 12px; margin: 20px 0; color: #475569; font-style: italic;">"${content}"</div>` : ''}
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL}/blog/${postTitle.toLowerCase().split(' ').join('-')}" style="display: inline-block; padding: 12px 30px; background: ${details.color}; color: white; text-decoration: none; border-radius: 12px; font-weight: bold;">View Article</a>
                    </div>
                </div>
                <div style="background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                    You are receiving this because you are the author of this post on Vichaar.
                </div>
            </div>
        </div>
    `;

    return sendEmail(authorEmail, subject, `New interaction on your post: ${postTitle}`, html);
};

export const sendPaymentEmail = async (userEmail: string, userName: string, planName: string, amount: number, status: 'success' | 'failed', paymentId?: string) => {
    const isSuccess = status === 'success';
    const subject = isSuccess ? `Subscription Active: Welcome to Vichaar Pro! 🚀` : `Payment Failed: Action Required ⚠️`;

    const html = `
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Inter', sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 28px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 15px 45px rgba(0,0,0,0.06);">
                <div style="background: ${isSuccess ? 'linear-gradient(135deg, #6241fe 0%, #8b5cf6 100%)' : '#ef4444'}; padding: 50px 30px; text-align: center; color: white;">
                    <div style="font-size: 50px; margin-bottom: 15px;">${isSuccess ? '💎' : '❌'}</div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">${isSuccess ? 'Payment Successful' : 'Payment Failed'}</h1>
                </div>
                <div style="padding: 40px;">
                    <p style="font-size: 16px; color: #1e293b; margin-bottom: 25px;">Hi <strong>${userName}</strong>,</p>
                    <p style="font-size: 15px; color: #475569; line-height: 1.6;">
                        ${isSuccess
            ? `Great news! Your payment for the <strong>${planName.replace('_', ' ')}</strong> subscription has been processed successfully. You now have full access to all Vichaar Pro features.`
            : `We couldn't process your payment for the <strong>${planName.replace('_', ' ')}</strong> plan. Please check your payment method and try again.`}
                    </p>
                    
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 25px; margin: 30px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 5px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Plan</td>
                                <td style="padding: 5px 0; color: #1e293b; font-size: 14px; font-weight: 700; text-align: right; text-transform: capitalize;">${planName.replace('_', ' ')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Amount Paid</td>
                                <td style="padding: 5px 0; color: #1e293b; font-size: 14px; font-weight: 700; text-align: right;">₹${amount}</td>
                            </tr>
                            ${paymentId ? `
                            <tr>
                                <td style="padding: 5px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Payment ID</td>
                                <td style="padding: 5px 0; color: #1e293b; font-size: 12px; font-weight: 600; text-align: right; font-family: monospace;">${paymentId}</td>
                            </tr>` : ''}
                            <tr>
                                <td style="padding: 5px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Status</td>
                                <td style="padding: 5px 0; color: ${isSuccess ? '#10b981' : '#ef4444'}; font-size: 13px; font-weight: 800; text-align: right; text-transform: uppercase;">${status}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="text-align: center; margin-top: 20px;">
                        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 14px 35px; background: ${isSuccess ? '#6241fe' : '#ef4444'}; color: white; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 14px; transition: all 0.3s shadow-lg shadow-primary-600/20;">
                            ${isSuccess ? 'Go to My Dashboard' : 'Try Again'}
                        </a>
                    </div>
                </div>
                <div style="background: #f1f5f9; padding: 25px; text-align: center; color: #94a3b8; font-size: 12px;">
                    Questions? Reply to this email or visit our <a href="${process.env.FRONTEND_URL}/help" style="color: #6241fe; text-decoration: none; font-weight: 700;">Help Center</a>.
                    <br><br>
                    &copy; 2026 Vichaar AI Platform. All rights reserved.
                </div>
            </div>
        </div>
    `;

    return sendEmail(userEmail, subject, `Payment ${status} for ${planName}`, html);
};


