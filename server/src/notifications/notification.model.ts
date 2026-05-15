import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
    recipient: Types.ObjectId;
    sender: Types.ObjectId;
    type: 'like' | 'dislike' | 'comment' | 'reply' | 'status_update';
    blog?: Types.ObjectId;
    comment?: Types.ObjectId;
    content: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    type: {
        type: String,
        enum: ['like', 'dislike', 'comment', 'reply', 'status_update'],
        required: true,
    },
    blog: {
        type: Schema.Types.ObjectId,
        ref: "Blog",
    },
    comment: {
        type: Schema.Types.ObjectId,
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

const NotificationModel = model<INotification>("Notification", NotificationSchema);
export default NotificationModel;
