"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    type: {
        type: String,
        enum: ['like', 'dislike', 'comment', 'reply', 'status_update'],
        required: true,
    },
    blog: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Blog",
    },
    comment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Comment",
    },
    content: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: { createdAt: true, updatedAt: false } });
const NotificationModel = (0, mongoose_1.model)("Notification", NotificationSchema);
exports.default = NotificationModel;
