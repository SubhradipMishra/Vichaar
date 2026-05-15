import { Document, Types } from "mongoose";

export interface IComment extends Document {
    blog: Types.ObjectId;
    user: Types.ObjectId;
    content: string;
    parentComment?: Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILike extends Document {
    blog: Types.ObjectId;
    user: Types.ObjectId;
    type: 'like' | 'dislike';
    createdAt: Date;
}
