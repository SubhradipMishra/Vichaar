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
    isPremium: boolean;
    subscriptionPlan?: "1_month" | "6_months" | "12_months";
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    savedPosts: Types.ObjectId[];
    followers: Types.ObjectId[];
    following: Types.ObjectId[];
    isSubscribed: boolean;
}