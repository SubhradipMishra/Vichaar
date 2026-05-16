import cron from 'node-cron';
import AuthModel from '../auth/auth.model';
import BlogModel from '../blog/blog.model';
import { sendNewsletterEmail } from './mail';

export const initCronJobs = () => {
    // Every other day at 9:00 AM (0 9 */2 * *)
    // For testing/demo purposes, we could run it more frequently, but as per request "every alternative day"
    cron.schedule('0 9 */2 * *', async () => {
        console.log('--- Starting Newsletter Cron Job ---');
        try {
            // 1. Get all subscribed users
            const subscribers = await AuthModel.find({ isSubscribed: true });
            if (subscribers.length === 0) {
                console.log('No subscribers found.');
                return;
            }

            // 2. Get a random published blog post
            const publishedBlogs = await BlogModel.find({ status: 'published' });
            if (publishedBlogs.length === 0) {
                console.log('No published blogs available.');
                return;
            }

            const randomBlog = publishedBlogs[Math.floor(Math.random() * publishedBlogs.length)];

            // 3. Send email to each subscriber
            console.log(`Sending newsletter for blog: "${randomBlog.title}" to ${subscribers.length} users.`);
            
            for (const user of subscribers) {
                try {
                    await sendNewsletterEmail(user.email, user.name, randomBlog);
                } catch (err) {
                    console.error(`Failed to send newsletter to ${user.email}:`, err);
                }
            }

            console.log('--- Newsletter Cron Job Completed ---');
        } catch (error) {
            console.error('Error in Newsletter Cron Job:', error);
        }
    });

    console.log('Newsletter cron job scheduled (Every 2 days at 9:00 AM)');
};
