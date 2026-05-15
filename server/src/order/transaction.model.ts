import { Schema, model, Document, Types } from "mongoose";

export interface ITransaction extends Document {
    orderId: Types.ObjectId;
    userId: Types.ObjectId;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    status: "success" | "failed";
    planName: string;
    createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
        razorpayPaymentId: { type: String, required: true, unique: true },
        razorpayOrderId: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        status: { type: String, enum: ["success", "failed"], required: true },
        planName: { type: String, required: true },
    },
    { timestamps: true }
);

export const TransactionModel = model<ITransaction>("Transaction", TransactionSchema);
