import { Response } from "express";
import NotificationModel from "./notification.model";

export const getMyNotifications = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const notifications = await NotificationModel.find({ recipient: userId })
            .populate("sender", "name profileImage")
            .populate("blog", "title slug _id")
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await NotificationModel.countDocuments({ recipient: userId, isRead: false });

        return res.status(200).json({ success: true, notifications, unreadCount });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const markAsRead = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { notificationId } = req.params;

        if (notificationId === 'all') {
            await NotificationModel.updateMany({ recipient: userId }, { isRead: true });
        } else {
            await NotificationModel.findOneAndUpdate({ _id: notificationId, recipient: userId }, { isRead: true });
        }

        return res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
