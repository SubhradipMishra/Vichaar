import { Schema, model, Types } from "mongoose";
import { IComment } from "./interaction.interface";

const CommentSchema = new Schema<IComment>({
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
    content: {
        type: String,
        required: true,
        trim: true,
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const CommentModel = model<IComment>("Comment", CommentSchema);
export default CommentModel;
