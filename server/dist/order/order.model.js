"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Auth", required: true },
    planName: {
        type: String,
        enum: ["1_month", "6_months", "12_months"],
        required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
}, { timestamps: true });
exports.OrderModel = (0, mongoose_1.model)("Order", OrderSchema);
