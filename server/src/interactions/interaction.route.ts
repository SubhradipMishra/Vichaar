import { Router } from "express";
import { 
    toggleLike, 
    addComment, 
    getCommentsByBlog, 
    deleteComment, 
    recordView 
} from "./interaction.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const interactionRouter = Router();

// Public routes
interactionRouter.get("/blog/:blogId/comments", getCommentsByBlog);
interactionRouter.post("/blog/:blogId/view", recordView);

// Protected routes
interactionRouter.post("/blog/:blogId/like", authMiddleware, toggleLike);
interactionRouter.post("/blog/:blogId/comment", authMiddleware, addComment);
interactionRouter.delete("/comment/:commentId", authMiddleware, deleteComment);

export default interactionRouter;
