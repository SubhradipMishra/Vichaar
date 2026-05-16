import { Document, Types } from "mongoose";

export interface IBlog extends Document {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    thumbnail: string;
    images?: string[];
    author: Types.ObjectId;
    tags?: string[];
    category: string;
    status: string;
    views?: number;
    likes: number;
    dislikes: number;
    bookmarks: Types.ObjectId[];
    readingTime?: number;
    commentsCount: number;
    isPremium: boolean;
    seoTitle: string;
    seoDescription: String;
    aiSummary: string;

    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}