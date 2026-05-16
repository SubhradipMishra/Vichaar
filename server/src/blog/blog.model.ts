

import { IBlog } from "./blog.interface";
import { Schema, Types } from "mongoose";
import { model } from "mongoose";

const BlogSchema = new Schema<IBlog>({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    excerpt: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: [],
    },
    author: {
        type: Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    category: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["draft", "pending", "published", "rejected", "archived"],
        default: "draft",
    },
    views: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: Number,
        default: 0,
    },
    bookmarks: {
        type: [Types.ObjectId],
        default: [],
    },
    readingTime: {
        type: Number,
        default: 0,
    },
    commentsCount: {
        type: Number,
        default: 0,
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    seoTitle: {
        type: String,
        required: true,
    },
    seoDescription: {
        type: String,
        required: true,
    },
    aiSummary: {
        type: String,
        required: true,
    },
    publishedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const BlogModel = model("Blog", BlogSchema);
export default BlogModel;