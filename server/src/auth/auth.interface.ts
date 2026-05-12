import { Document, Types } from "mongoose";

export interface IAuth extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    mobileNumber: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    profileImage?: string;
    bio?: string;
    role: "user" | "admin" | "superadmin";

}