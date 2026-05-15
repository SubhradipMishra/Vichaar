"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    blog: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Blog",
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    parentComment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const CommentModel = (0, mongoose_1.model)("Comment", CommentSchema);
exports.default = CommentModel;
