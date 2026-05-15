"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_model_1 = __importDefault(require("../auth/auth.model"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const seedAdmin = async () => {
    try {
        const mongoUri = process.env.DB_URL;
        if (!mongoUri) {
            throw new Error('DB_URL is not defined in .env');
        }
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(mongoUri);
        const adminEmail = 'subhradipmishra7781@gmail.com';
        const existingAdmin = await auth_model_1.default.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin already exists updating password and role...');
            existingAdmin.password = '2005';
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('Admin updated successfully.');
        }
        else {
            console.log('Creating new admin...');
            await auth_model_1.default.create({
                name: 'Subhradip Mishra',
                email: adminEmail,
                password: '2005',
                mobileNumber: '0000000000',
                role: 'admin',
                isActive: true
            });
            console.log('Admin created successfully.');
        }
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};
seedAdmin();
