import { Schema, model, Types } from "mongoose";
import { ILike } from "./interaction.interface";

const LikeSchema = new Schema<ILike>({
    blog: {
        type: Schema.Types.ObjectId,
        ref: "Blog",
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    type: {
        type: String,
        enum: ['like', 'dislike'],
        required: true,
    },
}, { timestamps: { createdAt: true, updatedAt: false } });

// Ensure a user can only have one interaction (like or dislike) per blog
LikeSchema.index({ blog: 1, user: 1 }, { unique: true });

const LikeModel = model<ILike>("Like", LikeSchema);
export default LikeModel;
