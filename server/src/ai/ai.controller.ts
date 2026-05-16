import { Request, Response } from 'express';
import axios from 'axios';
import AuthModel from '../auth/auth.model';
import cloudinary from '../utils/cloudinary';
import crypto from 'crypto';

const POLLINATIONS_TEXT_URL = "https://text.pollinations.ai/";
const POLLINATIONS_IMAGE_URL = "https://image.pollinations.ai/prompt/";

export const generateText = async (req: any, res: Response) => {
    try {
        const { prompt, systemPrompt } = req.body;
        const userId = req.user?.id || req.user?._id;
        const user = await AuthModel.findById(userId);

        console.log(`[AI Text] User ${userId} | Premium: ${user?.isPremium} | Role: ${user?.role}`);

        if (!user?.isPremium && !['admin', 'superadmin'].includes(user?.role || '')) {
            return res.status(403).json({ 
                success: false, 
                message: "AI Writing Assistant is a Pro feature. Upgrade to unlock!" 
            });
        }

        if (!prompt) return res.status(400).json({ success: false, message: "Prompt is required" });

        const encodedPrompt = encodeURIComponent(prompt);
        const encodedSystem = encodeURIComponent(systemPrompt || "You are a professional blogging assistant for Vichaar.");
        
        const response = await axios.get(`${POLLINATIONS_TEXT_URL}${encodedPrompt}?system=${encodedSystem}`, { timeout: 30000 });

        return res.status(200).json({
            success: true,
            text: response.data
        });

    } catch (error: any) {
        console.error("AI Text Generation Error:", error.message);
        return res.status(500).json({ success: false, message: "AI Assistant is taking too long to respond. Please try again." });
    }
};

export const generateImagePrompt = async (req: any, res: Response) => {
    try {
        const { title } = req.body;
        const userId = req.user?.id || req.user?._id;
        const user = await AuthModel.findById(userId);

        console.log(`[AI Image] User ${userId} | Premium: ${user?.isPremium} | Role: ${user?.role}`);

        if (!user?.isPremium && !['admin', 'superadmin'].includes(user?.role || '')) {
            return res.status(403).json({ 
                success: false, 
                message: "AI Image Generation is a Pro feature. Upgrade to unlock!" 
            });
        }

        if (!title) return res.status(400).json({ success: false, message: "Title is required" });

        const systemPrompt = "You are an AI that creates highly detailed image generation prompts for blog covers. Return ONLY the prompt, nothing else.";
        const promptRequest = `Create a cinematic, professional blog cover image prompt for this title: "${title}". Use styles like digital art, 4k, hyper-realistic.`;
        
        const encodedPrompt = encodeURIComponent(promptRequest);
        const encodedSystem = encodeURIComponent(systemPrompt);
        
        let finalImagePrompt = title;
        try {
            const promptResponse = await axios.get(`${POLLINATIONS_TEXT_URL}${encodedPrompt}?system=${encodedSystem}`, { timeout: 10000 });
            finalImagePrompt = promptResponse.data;
        } catch (e) {
            console.warn("[AI Image] Fancy prompt failed, using basic fallback.");
            finalImagePrompt = `Cinematic professional blog cover art for: ${title}, digital art, 4k, hyper-realistic, vivid colors`;
        }

        const imageUrl = `${POLLINATIONS_IMAGE_URL}${encodeURIComponent(finalImagePrompt)}?width=1280&height=720&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

        // Download image to local server buffer
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        
        // Upload to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "vichaar_ai",
                    public_id: `ai_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                    format: 'webp'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(imageResponse.data);
        });

        return res.status(200).json({
            success: true,
            imageUrl: (uploadResponse as any).secure_url
        });

    } catch (error: any) {
        console.error("AI Image Generation Error:", error.message);
        return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
};
