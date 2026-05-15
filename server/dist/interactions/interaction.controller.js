"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordView = exports.deleteComment = exports.getCommentsByBlog = exports.addComment = exports.toggleLike = void 0;
const comment_model_1 = __importDefault(require("./comment.model"));
const like_model_1 = __importDefault(require("./like.model"));
const blog_model_1 = __importDefault(require("../blog/blog.model"));
const notification_model_1 = __importDefault(require("../notifications/notification.model"));
const redisClient_1 = __importDefault(require("../redisClient"));
const mail_1 = require("../utils/mail");
const toggleLike = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { type } = req.body; // 'like' or 'dislike'
        const userId = req.user?.id || req.user?._id;
        if (!['like', 'dislike'].includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid interaction type" });
        }
        const existingInteraction = await like_model_1.default.findOne({ blog: blogId, user: userId });
        const blog = await blog_model_1.default.findById(blogId).populate("author", "name email");
        if (!blog)
            return res.status(404).json({ success: false, message: "Blog not found" });
        if (existingInteraction) {
            if (existingInteraction.type === type) {
                await like_model_1.default.findByIdAndDelete(existingInteraction._id);
                await blog_model_1.default.findByIdAndUpdate(blogId, { $inc: { [type === 'like' ? 'likes' : 'dislikes']: -1 } });
            }
            else {
                const oldType = existingInteraction.type;
                existingInteraction.type = type;
                await existingInteraction.save();
                await blog_model_1.default.findByIdAndUpdate(blogId, {
                    $inc: {
                        [type === 'like' ? 'likes' : 'dislikes']: 1,
                        [oldType === 'like' ? 'likes' : 'dislikes']: -1
                    }
                });
            }
        }
        else {
            await like_model_1.default.create({ blog: blogId, user: userId, type });
            await blog_model_1.default.findByIdAndUpdate(blogId, { $inc: { [type === 'like' ? 'likes' : 'dislikes']: 1 } });
            // Notification only for new interactions
            if (blog.author && blog.author._id.toString() !== userId.toString()) {
                const author = blog.author;
                // Dashboard Notification
                await notification_model_1.default.create({
                    recipient: author._id,
                    sender: userId,
                    type,
                    blog: blogId,
                    content: `${req.user.name} ${type}d your post: ${blog.title}`
                });
                // Email Notification
                (0, mail_1.sendAuthorInteractionEmail)(author.email, author.name, req.user.name, blog.title, type).catch(console.error);
            }
        }
        await redisClient_1.default.del(`blog:${blogId}`);
        await redisClient_1.default.del("blogs:all");
        const updatedBlog = await blog_model_1.default.findById(blogId).select("likes dislikes");
        return res.status(200).json({ success: true, likes: updatedBlog?.likes, dislikes: updatedBlog?.dislikes });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
exports.toggleLike = toggleLike;
const addComment = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { content, parentComment } = req.body;
        const userId = req.user?.id || req.user?._id;
        if (!content) {
            return res.status(400).json({ success: false, message: "Comment content is required" });
        }
        const blog = await blog_model_1.default.findById(blogId).populate("author", "name email");
        if (!blog)
            return res.status(404).json({ success: false, message: "Blog not found" });
        const comment = await comment_model_1.default.create({
            blog: blogId,
            user: userId,
            content,
            parentComment: parentComment || null
        });
        await blog_model_1.default.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } });
        // Notifications
        if (parentComment) {
            const parent = await comment_model_1.default.findById(parentComment).populate("user", "name email");
            if (parent && parent.user && parent.user._id.toString() !== userId.toString()) {
                const parentAuthor = parent.user;
                await notification_model_1.default.create({
                    recipient: parentAuthor._id,
                    sender: userId,
                    type: 'reply',
                    blog: blogId,
                    comment: comment._id,
                    content: `${req.user.name} replied to your comment: "${content.substring(0, 30)}..."`
                });
                (0, mail_1.sendAuthorInteractionEmail)(parentAuthor.email, parentAuthor.name, req.user.name, blog.title, 'reply', content).catch(console.error);
            }
        }
        else if (blog.author && blog.author._id.toString() !== userId.toString()) {
            const author = blog.author;
            await notification_model_1.default.create({
                recipient: author._id,
                sender: userId,
                type: 'comment',
                blog: blogId,
                comment: comment._id,
                content: `${req.user.name} commented on your post: "${content.substring(0, 30)}..."`
            });
            (0, mail_1.sendAuthorInteractionEmail)(author.email, author.name, req.user.name, blog.title, 'comment', content).catch(console.error);
        }
        const populatedComment = await comment.populate("user", "name profileImage");
        return res.status(201).json({ success: true, message: "Comment added", comment: populatedComment });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
exports.addComment = addComment;
const getCommentsByBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const comments = await comment_model_1.default.find({ blog: blogId, isDeleted: false })
            .populate("user", "name profileImage")
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, comments });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
exports.getCommentsByBlog = getCommentsByBlog;
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id || req.user?._id;
        const userRole = req.user?.role;
        const comment = await comment_model_1.default.findById(commentId);
        if (!comment)
            return res.status(404).json({ success: false, message: "Comment not found" });
        // Check if user is owner or admin
        if (comment.user.toString() !== userId.toString() && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        comment.isDeleted = true;
        await comment.save();
        await blog_model_1.default.findByIdAndUpdate(comment.blog, { $inc: { commentsCount: -1 } });
        return res.status(200).json({ success: true, message: "Comment deleted" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
exports.deleteComment = deleteComment;
const recordView = async (req, res) => {
    try {
        const { blogId } = req.params;
        await blog_model_1.default.findByIdAndUpdate(blogId, { $inc: { views: 1 } });
        // Invalidate cache
        await redisClient_1.default.del(`blog:${blogId}`);
        await redisClient_1.default.del("blogs:all");
        return res.status(200).json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.recordView = recordView;
