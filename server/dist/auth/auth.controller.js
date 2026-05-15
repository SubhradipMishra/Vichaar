"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.getSession = exports.getMe = exports.Logout = exports.Login = exports.signup = exports.requestOTP = void 0;
const auth_model_1 = __importDefault(require("./auth.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redisClient_1 = __importDefault(require("../redisClient"));
const mail_1 = require("../utils/mail");
const crypto_1 = __importDefault(require("crypto"));
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};
const requestOTP = async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        email = email.toLowerCase().trim();
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        // Store in Redis with 10 mins expiry
        await redisClient_1.default.setEx(`otp:${email}`, 600, otp);
        await (0, mail_1.sendOTPEmail)(email, otp);
        return res.status(200).json({ success: true, message: "OTP sent to your email" });
    }
    catch (err) {
        console.error("Error in requestOTP:", err);
        return res.status(500).json({ success: false, message: "Failed to send OTP", error: err.message });
    }
};
exports.requestOTP = requestOTP;
const signup = async (req, res) => {
    try {
        let { email, otp, password, name, mobileNumber } = req.body;
        if (!email || !otp || !password || !name) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        email = email.toLowerCase().trim();
        // Verify OTP
        const storedOtp = await redisClient_1.default.get(`otp:${email}`);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
        const existingUser = await auth_model_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with this email" });
        }
        const newUser = new auth_model_1.default({ email, password, name, mobileNumber: mobileNumber || "0000000000" });
        await newUser.save();
        // Delete OTP after successful signup
        await redisClient_1.default.del(`otp:${email}`);
        // Generate token and login user automatically
        const token = generateToken(newUser);
        res.cookie("AuthToken", token, COOKIE_OPTIONS);
        const userResponse = newUser.toObject();
        delete userResponse.password;
        userResponse.id = newUser._id;
        return res.status(201).json({ success: true, message: "User created and logged in successfully", user: userResponse, token });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};
exports.signup = signup;
const generateToken = (user) => {
    const payload = {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};
const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }
        const userFound = await auth_model_1.default.findOne({ email });
        if (!userFound) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, userFound.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }
        const token = generateToken(userFound);
        res.cookie("AuthToken", token, COOKIE_OPTIONS);
        const userResponse = userFound.toObject();
        delete userResponse.password;
        userResponse.id = userFound._id;
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: userResponse,
            token // Optional: also send in body if needed for mobile/other clients
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};
exports.Login = Login;
const Logout = async (req, res) => {
    try {
        res.clearCookie("AuthToken");
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};
exports.Logout = Logout;
const getMe = async (req, res) => {
    try {
        // Assuming user ID is attached to req by an auth middleware
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        const user = await auth_model_1.default.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};
exports.getMe = getMe;
const getSession = async (req, res) => {
    try {
        return res.status(200).json({ success: true, user: req.user });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
exports.getSession = getSession;
const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        email = email.toLowerCase().trim();
        const user = await auth_model_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User with this email does not exist" });
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        await redisClient_1.default.setEx(`otp:reset:${email}`, 600, otp);
        await (0, mail_1.sendForgotPasswordEmail)(email, otp);
        return res.status(200).json({ success: true, message: "Reset code sent to your email" });
    }
    catch (err) {
        console.error("Error in forgotPassword:", err);
        return res.status(500).json({ success: false, message: "Failed to send reset code", error: err.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        let { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        email = email.toLowerCase().trim();
        const storedOtp = await redisClient_1.default.get(`otp:reset:${email}`);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset code" });
        }
        const user = await auth_model_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Update password (pre-save hook will handle hashing)
        user.password = newPassword;
        await user.save();
        await redisClient_1.default.del(`otp:reset:${email}`);
        return res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });
    }
    catch (err) {
        console.error("Error in resetPassword:", err);
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};
exports.resetPassword = resetPassword;
