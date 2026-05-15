import { Router } from "express";
import { getMyNotifications, markAsRead } from "./notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const notificationRouter = Router();

notificationRouter.get("/", authMiddleware, getMyNotifications);
notificationRouter.patch("/:notificationId/read", authMiddleware, markAsRead);

export default notificationRouter;
