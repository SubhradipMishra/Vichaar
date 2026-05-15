"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const BlogSchema = new mongoose_1.Schema({
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
    thumbnil: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: [],
    },
    author: {
        type: mongoose_1.Types.ObjectId,
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
        type: [mongoose_1.Types.ObjectId],
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
const BlogModel = (0, mongoose_2.model)("Blog", BlogSchema);
exports.default = BlogModel;
