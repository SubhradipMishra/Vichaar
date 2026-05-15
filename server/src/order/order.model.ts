import { Schema, model, Document, Types } from "mongoose";

export interface IOrder extends Document {
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    userId: Types.ObjectId;
    planName: "1_month" | "6_months" | "12_months";
    amount: number;
    currency: string;
    status: "pending" | "paid" | "failed";
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
    {
        razorpayOrderId: { type: String, required: true, unique: true },
        razorpayPaymentId: { type: String },
        userId: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
        planName: { 
            type: String, 
            enum: ["1_month", "6_months", "12_months"], 
            required: true 
        },
        amount: { type: Number, required: true },
        currency: { type: String, default: "INR" },
        status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    },
    { timestamps: true }
);

export const OrderModel = model<IOrder>("Order", OrderSchema);
