import { Request, Response } from "express";
import CommentModel from "./comment.model";
import LikeModel from "./like.model";
import BlogModel from "../blog/blog.model";
import NotificationModel from "../notifications/notification.model";
import redisClient from "../redisClient";
import { sendAuthorInteractionEmail } from "../utils/mail";

export const toggleLike = async (req: any, res: Response) => {
    try {
        const { blogId } = req.params;
        const { type } = req.body; // 'like' or 'dislike'
        const userId = req.user?.id || req.user?._id;

        if (!['like', 'dislike'].includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid interaction type" });
        }

        const existingInteraction = await LikeModel.findOne({ blog: blogId, user: userId });
        const blog = await BlogModel.findById(blogId).populate("author", "name email");
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        if (existingInteraction) {
            if (existingInteraction.type === type) {
                await LikeModel.findByIdAndDelete(existingInteraction._id);
                await BlogModel.findByIdAndUpdate(blogId, { $inc: { [type === 'like' ? 'likes' : 'dislikes']: -1 } });
            } else {
                const oldType = existingInteraction.type;
                existingInteraction.type = type;
                await existingInteraction.save();
                await BlogModel.findByIdAndUpdate(blogId, { 
                    $inc: { 
                        [type === 'like' ? 'likes' : 'dislikes']: 1,
                        [oldType === 'like' ? 'likes' : 'dislikes']: -1
                    } 
                });
            }
        } else {
            await LikeModel.create({ blog: blogId, user: userId, type });
            await BlogModel.findByIdAndUpdate(blogId, { $inc: { [type === 'like' ? 'likes' : 'dislikes']: 1 } });

            // Notification only for new interactions
            if (blog.author && (blog.author as any)._id.toString() !== userId.toString()) {
                const author = blog.author as any;
                // Dashboard Notification
                await NotificationModel.create({
                    recipient: author._id,
                    sender: userId,
                    type,
                    blog: blogId,
                    content: `${req.user.name} ${type}d your post: ${blog.title}`
                });
                // Email Notification
                sendAuthorInteractionEmail(author.email, author.name, req.user.name, blog.title, type).catch(console.error);
            }
        }

        await redisClient.del(`blog:${blogId}`);
        await redisClient.del("blogs:all");

        const updatedBlog = await BlogModel.findById(blogId).select("likes dislikes");
        return res.status(200).json({ success: true, likes: updatedBlog?.likes, dislikes: (updatedBlog as any)?.dislikes });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const addComment = async (req: any, res: Response) => {
    try {
        const { blogId } = req.params;
        const { content, parentComment } = req.body;
        const userId = req.user?.id || req.user?._id;

        if (!content) {
            return res.status(400).json({ success: false, message: "Comment content is required" });
        }

        const blog = await BlogModel.findById(blogId).populate("author", "name email");
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        const comment = await CommentModel.create({
            blog: blogId,
            user: userId,
            content,
            parentComment: parentComment || null
        });

        await BlogModel.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } });

        // Notifications
        if (parentComment) {
            const parent = await CommentModel.findById(parentComment).populate("user", "name email");
            if (parent && parent.user && (parent.user as any)._id.toString() !== userId.toString()) {
                const parentAuthor = parent.user as any;
                await NotificationModel.create({
                    recipient: parentAuthor._id,
                    sender: userId,
                    type: 'reply',
                    blog: blogId,
                    comment: comment._id,
                    content: `${req.user.name} replied to your comment: "${content.substring(0, 30)}..."`
                });
                sendAuthorInteractionEmail(parentAuthor.email, parentAuthor.name, req.user.name, blog.title, 'reply', content).catch(console.error);
            }
        } else if (blog.author && (blog.author as any)._id.toString() !== userId.toString()) {
            const author = blog.author as any;
            await NotificationModel.create({
                recipient: author._id,
                sender: userId,
                type: 'comment',
                blog: blogId,
                comment: comment._id,
                content: `${req.user.name} commented on your post: "${content.substring(0, 30)}..."`
            });
            sendAuthorInteractionEmail(author.email, author.name, req.user.name, blog.title, 'comment', content).catch(console.error);
        }

        const populatedComment = await comment.populate("user", "name profileImage");
        return res.status(201).json({ success: true, message: "Comment added", comment: populatedComment });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const getCommentsByBlog = async (req: Request, res: Response) => {
    try {
        const { blogId } = req.params;
        const comments = await CommentModel.find({ blog: blogId, isDeleted: false })
            .populate("user", "name profileImage")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, comments });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const deleteComment = async (req: any, res: Response) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id || req.user?._id;
        const userRole = req.user?.role;

        const comment = await CommentModel.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

        // Check if user is owner or admin
        if (comment.user.toString() !== userId.toString() && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        comment.isDeleted = true;
        await comment.save();

        await BlogModel.findByIdAndUpdate(comment.blog, { $inc: { commentsCount: -1 } });

        return res.status(200).json({ success: true, message: "Comment deleted" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const recordView = async (req: Request, res: Response) => {
    try {
        const { blogId } = req.params;
        await BlogModel.findByIdAndUpdate(blogId, { $inc: { views: 1 } });
        
        // Invalidate cache
        await redisClient.del(`blog:${blogId}`);
        await redisClient.del("blogs:all");

        return res.status(200).json({ success: true });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
