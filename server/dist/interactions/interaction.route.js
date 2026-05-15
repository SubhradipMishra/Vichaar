"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interaction_controller_1 = require("./interaction.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const interactionRouter = (0, express_1.Router)();
// Public routes
interactionRouter.get("/blog/:blogId/comments", interaction_controller_1.getCommentsByBlog);
interactionRouter.post("/blog/:blogId/view", interaction_controller_1.recordView);
// Protected routes
interactionRouter.post("/blog/:blogId/like", auth_middleware_1.authMiddleware, interaction_controller_1.toggleLike);
interactionRouter.post("/blog/:blogId/comment", auth_middleware_1.authMiddleware, interaction_controller_1.addComment);
interactionRouter.delete("/comment/:commentId", auth_middleware_1.authMiddleware, interaction_controller_1.deleteComment);
exports.default = interactionRouter;
