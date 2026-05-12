
import { Router } from "express";
import { createBlog, deleteBlog, getAllBlog, getBlogByCategory, getBlogById, getBlogByAuthor, getIsPremium, updateBlog } from "./blog.controller";
import { userAdminGuard } from "../middleware/auth.middleware";
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

BlogRouter.delete("/delete/:blogId", userAdminGuard, deleteBlog)

export default BlogRouter;