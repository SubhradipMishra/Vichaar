"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LikeSchema = new mongoose_1.Schema({
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
    type: {
        type: String,
        enum: ['like', 'dislike'],
        required: true,
    },
}, { timestamps: { createdAt: true, updatedAt: false } });
// Ensure a user can only have one interaction (like or dislike) per blog
LikeSchema.index({ blog: 1, user: 1 }, { unique: true });
const LikeModel = (0, mongoose_1.model)("Like", LikeSchema);
exports.default = LikeModel;
