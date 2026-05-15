"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const AuthSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    mobileNumber: {
        type: String,
        required: true,
        trim: true,
    },
    bio: {
        type: String,
        trim: true,
    },
    profileImage: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        enum: ["user", "admin", "superadmin"],
        default: "user",
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    subscriptionPlan: {
        type: String,
        enum: ["1_month", "6_months", "12_months"],
    },
    subscriptionStartDate: {
        type: Date,
    },
    subscriptionEndDate: {
        type: Date,
    },
}, {
    timestamps: true,
});
AuthSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const hashedPassword = await bcrypt_1.default.hash(this.password, 10);
    this.password = hashedPassword;
});
const AuthModel = (0, mongoose_1.model)("Auth", AuthSchema);
exports.default = AuthModel;
