"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getAdminQueue = exports.likeBlog = exports.incrementViews = exports.getBlogByAuthor = exports.getBlogByCategory = exports.getIsPremium = exports.deleteBlog = exports.updateBlog = exports.getBlogById = exports.getAllBlog = exports.adminUpdateStatus = exports.submitForReview = exports.createBlog = void 0;
const blog_model_1 = __importDefault(require("./blog.model"));
const redisClient_1 = __importDefault(require("../redisClient"));
const mail_1 = require("../utils/mail");
const auth_model_1 = __importDefault(require("../auth/auth.model"));
const notification_model_1 = __importDefault(require("../notifications/notification.model"));
const createBlog = async (req, res) => {
    try {
        const { title, slug, content, excerpt, tags, category, status, seoTitle, seoDescription, aiSummary } = req.body;
        const authorId = req.user?.id || req.user?._id;
        if (!authorId) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user found in session" });
        }
        const files = req.files;
        const thumbnil = files?.thumbnil?.[0] ? `/uploads/${files.thumbnil[0].filename}` : "";
        const images = files?.images ? files.images.map(file => `/uploads/${file.filename}`) : [];
        const blog = await blog_model_1.default.create({
            title, slug, content, excerpt, thumbnil, images, author: authorId,
            tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
            category, status: status || "draft", seoTitle, seoDescription, aiSummary,
            readingTime: req.body.readingTime || 0
        });
        const user = await auth_model_1.default.findById(authorId);
        if (user) {
            const admins = await auth_model_1.default.find({ role: { $in: ['admin', 'superadmin'] } });
            const adminEmails = admins.map(a => a.email);
            await (0, mail_1.sendPostStatusEmail)(user.email, user.name, blog.title, blog.status, undefined, adminEmails);
        }
        // Invalidate all blogs cache
        await redisClient_1.default.del("blogs:all");
        return res.status(201).json({ success: true, message: "Blog created successfully", blog });
    }
    catch (error) {
        console.error("Error creating blog:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.createBlog = createBlog;
const submitForReview = async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await blog_model_1.default.findById(blogId);
        if (!blog)
            return res.status(404).json({ success: false, message: "Blog not found" });
        if (blog.status !== 'draft' && blog.status !== 'rejected') {
            return res.status(400).json({ success: false, message: "Post must be a draft or rejected to submit for review" });
        }
        blog.status = 'pending';
        await blog.save();
        const user = await auth_model_1.default.findById(blog.author);
        if (user) {
            const admins = await auth_model_1.default.find({ role: { $in: ['admin', 'superadmin'] } });
            const adminEmails = admins.map(a => a.email);
            await (0, mail_1.sendPostStatusEmail)(user.email, user.name, blog.title, 'pending', undefined, adminEmails);
        }
        await redisClient_1.default.del("blogs:all");
        return res.status(200).json({ success: true, message: "Post submitted for review", blog });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.submitForReview = submitForReview;
const adminUpdateStatus = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { status, feedback } = req.body;
        if (!['published', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status update" });
        }
        const blog = await blog_model_1.default.findById(blogId);
        if (!blog)
            return res.status(404).json({ success: false, message: "Blog not found" });
        blog.status = status;
        if (status === 'published')
            blog.publishedAt = new Date();
        await blog.save();
        const user = await auth_model_1.default.findById(blog.author);
        if (user) {
            const admins = await auth_model_1.default.find({ role: { $in: ['admin', 'superadmin'] } });
            const adminEmails = admins.map(a => a.email);
            // Dashboard Notification
            await notification_model_1.default.create({
                recipient: user._id,
                sender: req.user.id || req.user._id,
                type: 'status_update',
                blog: blogId,
                content: `Your post "${blog.title}" has been ${status}${status === 'published' ? ' and is now live!' : '.'}`
            });
            await (0, mail_1.sendPostStatusEmail)(user.email, user.name, blog.title, status, feedback, adminEmails);
        }
        await redisClient_1.default.del("blogs:all");
        await redisClient_1.default.del(`blog:${blogId}`);
        return res.status(200).json({ success: true, message: `Post ${status} successfully`, blog });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.adminUpdateStatus = adminUpdateStatus;
const getAllBlog = async (req, res) => {
    try {
        // Try to get from cache
        try {
            if (redisClient_1.default.isOpen) {
                const cachedBlogs = await redisClient_1.default.get("blogs:all");
                if (cachedBlogs) {
                    return res.status(200).json({ success: true, message: "Blogs fetched from cache", blogs: JSON.parse(cachedBlogs) });
                }
            }
        }
        catch (redisError) {
            console.error("Redis Get Error:", redisError);
        }
        const blogs = await blog_model_1.default.find({ status: "published" }).populate("author", "name email profileImage");
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ success: false, message: "No blogs found" });
        }
        // Set to cache for 1 hour
        try {
            await redisClient_1.default.setEx("blogs:all", 3600, JSON.stringify(blogs));
        }
        catch (redisError) {
            console.error("Redis Set Error:", redisError);
        }
        return res.status(200).json({ success: true, message: "Blogs fetched successfully", blogs });
    }
    catch (error) {
        console.error("Error fetching all blogs:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
exports.getAllBlog = getAllBlog;
const getBlogById = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        // Try to get from cache
        try {
            const cachedBlog = await redisClient_1.default.get(`blog:${blogId}`);
            if (cachedBlog) {
                return res.status(200).json({ success: true, message: "Blog fetched from cache", blog: JSON.parse(cachedBlog) });
            }
        }
        catch (redisError) {
            console.error("Redis Get Error:", redisError);
        }
        const blog = await blog_model_1.default.findById(blogId).populate("author", "name email profileImage");
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        // Set to cache for 1 hour
        try {
            await redisClient_1.default.setEx(`blog:${blogId}`, 3600, JSON.stringify(blog));
        }
        catch (redisError) {
            console.error("Redis Set Error:", redisError);
        }
        return res.status(200).json({ success: true, message: "Blog fetched successfully", blog });
    }
    catch (error) {
        console.error("Error fetching blog by ID:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
exports.getBlogById = getBlogById;
const updateBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const updateData = { ...req.body };
        const files = req.files;
        if (files?.thumbnil?.[0]) {
            updateData.thumbnil = `/uploads/${files.thumbnil[0].filename}`;
        }
        if (files?.images) {
            updateData.images = files.images.map(file => `/uploads/${file.filename}`);
        }
        if (updateData.tags && !Array.isArray(updateData.tags)) {
            try {
                updateData.tags = JSON.parse(updateData.tags);
            }
            catch (e) {
                updateData.tags = [updateData.tags];
            }
        }
        const blog = await blog_model_1.default.findByIdAndUpdate(blogId, updateData, { new: true });
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        // Invalidate cache
        await redisClient_1.default.del("blogs:all");
        await redisClient_1.default.del(`blog:${blogId}`);
        return res.status(200).json({ success: true, message: "Blog updated successfully", blog });
    }
    catch (error) {
        console.error("Error updating blog:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updateBlog = updateBlog;
const deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const blog = await blog_model_1.default.findByIdAndDelete(blogId);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        // Invalidate cache
        await redisClient_1.default.del("blogs:all");
        await redisClient_1.default.del(`blog:${blogId}`);
        return res.status(200).json({ success: true, message: "Blog deleted successfully", blog });
    }
    catch (error) {
        console.error("Error deleting blog:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.deleteBlog = deleteBlog;
const getIsPremium = async (req, res) => {
    try {
        const blogs = await blog_model_1.default.find({ isPremium: true }).populate("author", "name email");
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ success: false, message: "No premium blogs found" });
        }
        return res.status(200).json({ success: true, message: "Premium blogs fetched successfully", blogs });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getIsPremium = getIsPremium;
const getBlogByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const blogs = await blog_model_1.default.find({ category }).populate("author", "name email");
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ success: false, message: "No blogs found" });
        }
        return res.status(200).json({ success: true, message: "Blogs fetched successfully", blogs });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getBlogByCategory = getBlogByCategory;
const getBlogByAuthor = async (req, res) => {
    try {
        const author = req.params.author;
        const blogs = await blog_model_1.default.find({ author }).populate("author", "name email");
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ success: false, message: "No blogs found" });
        }
        return res.status(200).json({ success: true, message: "Blogs fetched successfully", blogs });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getBlogByAuthor = getBlogByAuthor;
const incrementViews = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const blog = await blog_model_1.default.findByIdAndUpdate(blogId, { $inc: { views: 1 } }, { new: true });
        if (!blog)
            return res.status(404).json({ success: false, message: "Blog not found" });
        // Invalidate cache
        await redisClient_1.default.del(`blog:${blogId}`);
        await redisClient_1.default.del("blogs:all");
        return res.status(200).json({ success: true, views: blog.views });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.incrementViews = incrementViews;
const likeBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const blog = await blog_model_1.default.findByIdAndUpdate(blogId, { $inc: { likes: 1 } }, { new: true });
        if (!blog)
            return res.status(404).json({ success: false, message: "Blog not found" });
        // Invalidate cache
        await redisClient_1.default.del(`blog:${blogId}`);
        await redisClient_1.default.del("blogs:all");
        return res.status(200).json({ success: true, likes: blog.likes });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.likeBlog = likeBlog;
const getAdminQueue = async (req, res) => {
    try {
        const blogs = await blog_model_1.default.find({ status: "pending" })
            .populate("author", "name email profileImage")
            .sort({ createdAt: 1 }); // Oldest first for queue
        return res.status(200).json({ success: true, blogs });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getAdminQueue = getAdminQueue;
const getDashboardStats = async (req, res) => {
    try {
        const authorId = req.user?.id || req.user?._id;
        if (!authorId)
            return res.status(401).json({ success: false, message: "Unauthorized" });
        const blogs = await blog_model_1.default.find({ author: authorId }).sort({ createdAt: -1 });
        const totalPosts = blogs.length;
        const totalViews = blogs.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const totalLikes = blogs.reduce((acc, curr) => acc + (curr.likes || 0), 0);
        const recentActivity = blogs.slice(0, 5).map(b => ({
            id: b._id,
            title: b.title,
            type: 'Published a new post',
            time: b.createdAt
        }));
        return res.status(200).json({
            success: true,
            stats: {
                totalPosts,
                totalViews,
                totalLikes,
                avgReadTime: "4m 12s"
            },
            recentActivity,
            blogs
        });
    }
    catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getDashboardStats = getDashboardStats;
