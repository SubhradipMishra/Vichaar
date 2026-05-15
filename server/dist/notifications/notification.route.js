"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notificationRouter = (0, express_1.Router)();
notificationRouter.get("/", auth_middleware_1.authMiddleware, notification_controller_1.getMyNotifications);
notificationRouter.patch("/:notificationId/read", auth_middleware_1.authMiddleware, notification_controller_1.markAsRead);
exports.default = notificationRouter;
