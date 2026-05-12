import BlogModel from "./blog.model";
import { Request, Response } from "express";
import redisClient from "../redisClient";
import { sendPostStatusEmail } from "../utils/mail";
import AuthModel from "../auth/auth.model";

export const createBlog = async (req: any, res: Response) => {
    try {
        const { title, slug, content, excerpt, tags, category, status, seoTitle, seoDescription, aiSummary } = req.body;
        const authorId = req.user?.id || req.user?._id;

        if (!authorId) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user found in session" });
        }
        
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const thumbnil = files?.thumbnil?.[0] ? `/uploads/${files.thumbnil[0].filename}` : "";
        const images = files?.images ? files.images.map(file => `/uploads/${file.filename}`) : [];

        const blog = await BlogModel.create({ 
            title, slug, content, excerpt, thumbnil, images, author: authorId, 
            tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [], 
            category, status: status || "draft", seoTitle, seoDescription, aiSummary,
            readingTime: req.body.readingTime || 0
        });

        const user = await AuthModel.findById(authorId);
        if (user) {
            await sendPostStatusEmail(user.email, user.name, blog.title, blog.status);
        }

        // Invalidate all blogs cache
        await redisClient.del("blogs:all");

        return res.status(201).json({ success: true, message: "Blog created successfully", blog });
    } catch (error) {
        console.error("Error creating blog:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const submitForReview = async (req: any, res: Response) => {
    try {
        const { blogId } = req.params;
        const blog = await BlogModel.findById(blogId);

        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
        if (blog.status !== 'draft' && blog.status !== 'rejected') {
            return res.status(400).json({ success: false, message: "Post must be a draft or rejected to submit for review" });
        }

        blog.status = 'pending';
        await blog.save();

        const user = await AuthModel.findById(blog.author);
        if (user) {
            await sendPostStatusEmail(user.email, user.name, blog.title, 'pending');
        }

        await redisClient.del("blogs:all");
        return res.status(200).json({ success: true, message: "Post submitted for review", blog });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const adminUpdateStatus = async (req: any, res: Response) => {
    try {
        const { blogId } = req.params;
        const { status, feedback } = req.body;

        if (!['published', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status update" });
        }

        const blog = await BlogModel.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        blog.status = status;
        if (status === 'published') (blog as any).publishedAt = new Date();
        await blog.save();

        const user = await AuthModel.findById(blog.author);
        if (user) {
            await sendPostStatusEmail(user.email, user.name, blog.title, status, feedback);
        }

        await redisClient.del("blogs:all");
        await redisClient.del(`blog:${blogId}`);

        return res.status(200).json({ success: true, message: `Post ${status} successfully`, blog });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getAllBlog = async (req: Request, res: Response) => {
    try {
        // Try to get from cache
        try {
            if (redisClient.isOpen) {
                const cachedBlogs = await redisClient.get("blogs:all");
                if (cachedBlogs) {
                    return res.status(200).json({ success: true, message: "Blogs fetched from cache", blogs: JSON.parse(cachedBlogs) });
                }
            }
        } catch (redisError) {
            console.error("Redis Get Error:", redisError);
        }

        const blogs = await BlogModel.find({ status: "published" }).populate("author", "name email profileImage");

        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ success: false, message: "No blogs found" });
        }

        // Set to cache for 1 hour
        try {
            await redisClient.setEx("blogs:all", 3600, JSON.stringify(blogs));
        } catch (redisError) {
            console.error("Redis Set Error:", redisError);
        }

        return res.status(200).json({ success: true, message: "Blogs fetched successfully", blogs });
    } catch (error: any) {
        console.error("Error fetching all blogs:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

export const getBlogById = async (req: Request, res: Response) => {
    try {
        const blogId = req.params.blogId;

        // Try to get from cache
        try {
            const cachedBlog = await redisClient.get(`blog:${blogId}`);
            if (cachedBlog) {
                return res.status(200).json({ success: true, message: "Blog fetched from cache", blog: JSON.parse(cachedBlog) });
            }
        } catch (redisError) {
            console.error("Redis Get Error:", redisError);
        }

        const blog = await BlogModel.findById(blogId).populate("author", "name email profileImage");

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        // Set to cache for 1 hour
        try {
            await redisClient.setEx(`blog:${blogId}`, 3600, JSON.stringify(blog));
        } catch (redisError) {
            console.error("Redis Set Error:", redisError);
        }

        return res.status(200).json({ success: true, message: "Blog fetched successfully", blog });
    } catch (error: any) {
        console.error("Error fetching blog by ID:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

export const updateBlog = async (req: Request, res: Response) => {
    try {
        const blogId = req.params.blogId;
        const updateData = { ...req.body };

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files?.thumbnil?.[0]) {
            updateData.thumbnil = `/uploads/${files.thumbnil[0].filename}`;
        }
        if (files?.images) {
            updateData.images = files.images.map(file => `/uploads/${file.filename}`);
        }

        if (updateData.tags && !Array.isArray(updateData.tags)) {
            try {
                updateData.tags = JSON.parse(updateData.tags);
            } catch (e) {
                updateData.tags = [updateData.tags];
            }
        }

        const blog = await BlogModel.findByIdAndUpdate(blogId, updateData, { new: true });

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        // Invalidate cache
        await redisClient.del("blogs:all");
        await redisClient.del(`blog:${blogId}`);

        return res.status(200).json({ success: true, message: "Blog updated successfully", blog });
    } catch (error) {
        console.error("Error updating blog:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const blogId = req.params.blogId;
        const blog = await BlogModel.findByIdAndDelete(blogId);

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        // Invalidate cache
        await redisClient.del("blogs:all");
        await redisClient.del(`blog:${blogId}`);

        return res.status(200).json({ success: true, message: "Blog deleted successfully", blog });
    } catch (error) {
        console.error("Error deleting blog:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getIsPremium = async (req: Request, res: Response) => {
    try {
        const blogs = await BlogModel.find({ isPremium: true }).populate("author", "name email");

        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ success: false, message: "No premium blogs found" });
        }

        return res.status(200).json({ success: true, message: "Premium blogs fetched successfully", blogs });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getBlogByCategory = async (req: Request, res: Response) => {
    try {
        const category = req.params.category;
        const blogs = await BlogModel.find({ category }).populate("author", "name email");

        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ success: false, message: "No blogs found" });
        }

        return res.status(200).json({ success: true, message: "Blogs fetched successfully", blogs });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getBlogByAuthor = async (req: Request, res: Response) => {
    try {
        const author = req.params.author;
        const blogs = await BlogModel.find({ author }).populate("author", "name email");

        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ success: false, message: "No blogs found" });
        }

        return res.status(200).json({ success: true, message: "Blogs fetched successfully", blogs });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const incrementViews = async (req: Request, res: Response) => {
    try {
        const blogId = req.params.blogId;
        const blog = await BlogModel.findByIdAndUpdate(blogId, { $inc: { views: 1 } }, { new: true });
        
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        // Invalidate cache
        await redisClient.del(`blog:${blogId}`);
        await redisClient.del("blogs:all");

        return res.status(200).json({ success: true, views: blog.views });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const likeBlog = async (req: Request, res: Response) => {
    try {
        const blogId = req.params.blogId;
        const blog = await BlogModel.findByIdAndUpdate(blogId, { $inc: { likes: 1 } }, { new: true });

        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        // Invalidate cache
        await redisClient.del(`blog:${blogId}`);
        await redisClient.del("blogs:all");

        return res.status(200).json({ success: true, likes: blog.likes });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getAdminQueue = async (req: any, res: Response) => {
    try {
        const blogs = await BlogModel.find({ status: "pending" })
            .populate("author", "name email profileImage")
            .sort({ createdAt: 1 }); // Oldest first for queue

        return res.status(200).json({ success: true, blogs });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getDashboardStats = async (req: any, res: Response) => {
    try {
        const authorId = req.user?.id || req.user?._id;
        if (!authorId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const blogs = await BlogModel.find({ author: authorId }).sort({ createdAt: -1 });
        
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
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}