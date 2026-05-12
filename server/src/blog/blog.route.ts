
import { Router } from "express";
import { createBlog, deleteBlog, getAllBlog, getBlogByCategory, getBlogById, getBlogByAuthor, getIsPremium, updateBlog, incrementViews, likeBlog, getDashboardStats, submitForReview, adminUpdateStatus, getAdminQueue } from "./blog.controller";
import { userAdminGuard, AdminGaurd } from "../middleware/auth.middleware";
import { upload } from "../middleware/multer.middleware";


const BlogRouter = Router();
BlogRouter.post("/create", userAdminGuard, upload.fields([
    { name: "thumbnil", maxCount: 1 },
    { name: "images", maxCount: 10 }
]), createBlog)

BlogRouter.get("/", getAllBlog)
BlogRouter.get("/:blogId", getBlogById)
BlogRouter.get("/premium", getIsPremium)
BlogRouter.get("/category/:category", getBlogByCategory)
BlogRouter.get("/author/:author", getBlogByAuthor)

BlogRouter.put("/update/:blogId", userAdminGuard, upload.fields([
    { name: "thumbnil", maxCount: 1 },
    { name: "images", maxCount: 10 }
]), updateBlog)

BlogRouter.post("/:blogId/submit", userAdminGuard, submitForReview)
BlogRouter.patch("/:blogId/status", AdminGaurd, adminUpdateStatus)
BlogRouter.get("/admin/queue", AdminGaurd, getAdminQueue)

BlogRouter.delete("/delete/:blogId", userAdminGuard, deleteBlog)
BlogRouter.get("/user/stats", userAdminGuard, getDashboardStats)
BlogRouter.patch("/:blogId/view", incrementViews)
BlogRouter.patch("/:blogId/like", likeBlog)

export default BlogRouter;