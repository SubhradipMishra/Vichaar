import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import AuthModel from '../auth/auth.model';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedAdmin = async () => {
    try {
        const mongoUri = process.env.DB_URL;
        if (!mongoUri) {
            throw new Error('DB_URL is not defined in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);

        const adminEmail = 'subhradipmishra7781@gmail.com';
        const existingAdmin = await AuthModel.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists updating password and role...');
            existingAdmin.password = '2005';
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('Admin updated successfully.');
        } else {
            console.log('Creating new admin...');
            await AuthModel.create({
                name: 'Subhradip Mishra',
                email: adminEmail,
                password: '2005',
                mobileNumber: '0000000000',
                role: 'admin',
                isActive: true
            });
            console.log('Admin created successfully.');
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
