"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getMyNotifications = void 0;
const notification_model_1 = __importDefault(require("./notification.model"));
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const notifications = await notification_model_1.default.find({ recipient: userId })
            .populate("sender", "name profileImage")
            .populate("blog", "title slug _id")
            .sort({ createdAt: -1 })
            .limit(50);
        const unreadCount = await notification_model_1.default.countDocuments({ recipient: userId, isRead: false });
        return res.status(200).json({ success: true, notifications, unreadCount });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getMyNotifications = getMyNotifications;
const markAsRead = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { notificationId } = req.params;
        if (notificationId === 'all') {
            await notification_model_1.default.updateMany({ recipient: userId }, { isRead: true });
        }
        else {
            await notification_model_1.default.findOneAndUpdate({ _id: notificationId, recipient: userId }, { isRead: true });
        }
        return res.status(200).json({ success: true, message: "Marked as read" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.markAsRead = markAsRead;
