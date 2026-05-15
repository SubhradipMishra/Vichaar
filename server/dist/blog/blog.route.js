"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = require("./blog.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_middleware_1 = require("../middleware/multer.middleware");
const BlogRouter = (0, express_1.Router)();
BlogRouter.post("/create", auth_middleware_1.userAdminGuard, multer_middleware_1.upload.fields([
    { name: "thumbnil", maxCount: 1 },
    { name: "images", maxCount: 10 }
]), blog_controller_1.createBlog);
BlogRouter.get("/", blog_controller_1.getAllBlog);
BlogRouter.get("/:blogId", blog_controller_1.getBlogById);
BlogRouter.get("/premium", blog_controller_1.getIsPremium);
BlogRouter.get("/category/:category", blog_controller_1.getBlogByCategory);
BlogRouter.get("/author/:author", blog_controller_1.getBlogByAuthor);
BlogRouter.put("/update/:blogId", auth_middleware_1.userAdminGuard, multer_middleware_1.upload.fields([
    { name: "thumbnil", maxCount: 1 },
    { name: "images", maxCount: 10 }
]), blog_controller_1.updateBlog);
BlogRouter.post("/:blogId/submit", auth_middleware_1.userAdminGuard, blog_controller_1.submitForReview);
BlogRouter.patch("/:blogId/status", auth_middleware_1.AdminGaurd, blog_controller_1.adminUpdateStatus);
BlogRouter.get("/admin/queue", auth_middleware_1.AdminGaurd, blog_controller_1.getAdminQueue);
BlogRouter.delete("/delete/:blogId", auth_middleware_1.userAdminGuard, blog_controller_1.deleteBlog);
BlogRouter.get("/user/stats", auth_middleware_1.userAdminGuard, blog_controller_1.getDashboardStats);
BlogRouter.patch("/:blogId/view", blog_controller_1.incrementViews);
BlogRouter.patch("/:blogId/like", blog_controller_1.likeBlog);
exports.default = BlogRouter;
