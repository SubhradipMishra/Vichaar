
import AuthModel from "./auth.model";
import BlogModel from "../blog/blog.model";
import { Response, Request } from "express";
import bcrypt from "bcrypt"
import { IAuth } from "./auth.interface";
import jwt from "jsonwebtoken"
import redisClient from "../redisClient";
import { sendOTPEmail, sendForgotPasswordEmail } from "../utils/mail";
import crypto from "crypto";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const requestOTP = async (req: Request, res: Response) => {
    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        email = email.toLowerCase().trim();

        const otp = crypto.randomInt(100000, 999999).toString();

        // Store in Redis with 10 mins expiry
        await redisClient.setEx(`otp:${email}`, 600, otp);

        await sendOTPEmail(email, otp);

        return res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (err: any) {
        console.error("Error in requestOTP:", err);
        return res.status(500).json({ success: false, message: "Failed to send OTP", error: err.message });
    }
}

export const signup = async (req: Request, res: Response) => {
    try {
        let { email, otp, password, name, mobileNumber } = req.body;

        if (!email || !otp || !password || !name) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        email = email.toLowerCase().trim();

        // Verify OTP
        const storedOtp = await redisClient.get(`otp:${email}`);

        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        const existingUser = await AuthModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with this email" });
        }

        const newUser = new AuthModel({ email, password, name, mobileNumber: mobileNumber || "0000000000" });
        await newUser.save();

        // Delete OTP after successful signup
        await redisClient.del(`otp:${email}`);

        // Generate token and login user automatically
        const token = generateToken(newUser);
        res.cookie("AuthToken", token, COOKIE_OPTIONS);

        const userResponse = newUser.toObject();
        delete (userResponse as any).password;
        (userResponse as any).id = newUser._id;

        return res.status(201).json({ success: true, message: "User created and logged in successfully", user: userResponse, token });
    }
    catch (err: any) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
}

const generateToken = (user: IAuth) => {
    const payload = {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name
    };

    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "7d" });
}

export const Login = async (req: Request, res: Response) => {
    try {
        const { email, password }: { email: string, password: string } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const userFound = await AuthModel.findOne({ email });
        if (!userFound) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, userFound.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const token = generateToken(userFound);

        res.cookie("AuthToken", token, COOKIE_OPTIONS);

        const userResponse = userFound.toObject();
        delete (userResponse as any).password;
        (userResponse as any).id = userFound._id;

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: userResponse,
            token // Optional: also send in body if needed for mobile/other clients
        });
    }
    catch (err: any) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
}

export const Logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("AuthToken");
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
}

export const getMe = async (req: any, res: Response) => {
    try {
        // Assuming user ID is attached to req by an auth middleware
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        const user = await AuthModel.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, user });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
}

export const getSession = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

        const user = await AuthModel.findById(userId).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({ success: true, user });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        email = email.toLowerCase().trim();

        const user = await AuthModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User with this email does not exist" });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        await redisClient.setEx(`otp:reset:${email}`, 600, otp);

        await sendForgotPasswordEmail(email, otp);

        return res.status(200).json({ success: true, message: "Reset code sent to your email" });
    } catch (err: any) {
        console.error("Error in forgotPassword:", err);
        return res.status(500).json({ success: false, message: "Failed to send reset code", error: err.message });
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        let { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        email = email.toLowerCase().trim();

        const storedOtp = await redisClient.get(`otp:reset:${email}`);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset code" });
        }

        const user = await AuthModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update password (pre-save hook will handle hashing)
        user.password = newPassword;
        await user.save();

        await redisClient.del(`otp:reset:${email}`);

        return res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });
    } catch (err: any) {
        console.error("Error in resetPassword:", err);
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
}

export const toggleFollowUser = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { targetUserId } = req.params;

        if (userId === targetUserId) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }

        const user = await AuthModel.findById(userId);
        const targetUser = await AuthModel.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isFollowing = user.following.includes(targetUserId as any);

        if (isFollowing) {
            user.following = user.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
            await user.save();
            await targetUser.save();
            return res.status(200).json({ success: true, message: "Unfollowed successfully", isFollowing: false });
        } else {
            user.following.push(targetUserId as any);
            targetUser.followers.push(userId as any);
            await user.save();
            await targetUser.save();
            return res.status(200).json({ success: true, message: "Followed successfully", isFollowing: true });
        }
    } catch (error) {
        console.error("Error in toggleFollowUser:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await AuthModel.findById(userId).select("-password -email -mobileNumber");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const blogs = await BlogModel.find({ author: userId, status: "published" }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            user,
            blogs,
            stats: {
                followers: user.followers.length,
                following: user.following.length,
                totalBlogs: blogs.length
            }
        });
    } catch (error) {
        console.error("Error in getPublicProfile:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const toggleNewsletter = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        const user = await AuthModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isSubscribed = !user.isSubscribed;
        await user.save();

        return res.status(200).json({
            success: true,
            message: user.isSubscribed ? "Subscribed to newsletter successfully" : "Unsubscribed from newsletter successfully",
            isSubscribed: user.isSubscribed
        });
    } catch (error: any) {
        console.error("Error in toggleNewsletter:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}