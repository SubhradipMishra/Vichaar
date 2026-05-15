import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { OrderModel } from "../order/order.model";
import { TransactionModel } from "../order/transaction.model";
import AuthModel from "../auth/auth.model";
import { sendPaymentEmail } from "../utils/mail";

const razorpay = new Razorpay({
    key_id: process.env.RZP_KEY as string,
    key_secret: process.env.RZP_SECRET as string,
});

const PLAN_PRICES = {
    "1_month": 299,
    "6_months": 1499,
    "12_months": 2499,
};

const activateSubscription = async (order: any) => {
    try {
        const user = await AuthModel.findById(order.userId);
        if (!user) {
            console.error(`[Activate] User not found: ${order.userId}`);
            return null;
        }

        const startDate = new Date();
        const endDate = new Date();

        if (order.planName === "1_month") {
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (order.planName === "6_months") {
            endDate.setMonth(endDate.getMonth() + 6);
        } else if (order.planName === "12_months") {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const updatedUser = await AuthModel.findByIdAndUpdate(order.userId, {
            isPremium: true,
            subscriptionPlan: order.planName,
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
        }, { new: true });

        console.log(`[Activate] Success for user ${order.userId} | Plan: ${order.planName}`);
        return updatedUser;
    } catch (error) {
        console.error(`[Activate] Error activating for user ${order.userId}:`, error);
        return null;
    }
};

export const createOrder = async (req: any, res: Response) => {
    try {
        const { planName } = req.body;
        const amount = PLAN_PRICES[planName as keyof typeof PLAN_PRICES];

        if (!amount) {
            return res.status(400).json({ error: "Invalid plan name" });
        }

        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
            notes: {
                userId: req.user.id,
                planName: planName,
            },
        };

        const rzpOrder = await razorpay.orders.create(options);

        // Save order in database
        await OrderModel.create({
            razorpayOrderId: rzpOrder.id,
            userId: req.user.id,
            planName: planName,
            amount: amount,
            currency: "INR",
            status: "pending",
        });

        res.status(200).json(rzpOrder);
    } catch (error: any) {
        console.error("Create Order Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    console.log("WEBHOOK>...")
    const secret = process.env.RZP_WEBHOOK_SECRET as string;
    const signature = req.headers["x-razorpay-signature"] as string;

    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

    if (expectedSignature === signature) {
        const payload = req.body;
        if (payload.event === "payment.captured") {
            const { order_id, id: payment_id } = payload.payload.payment.entity;

            const order = await OrderModel.findOne({ razorpayOrderId: order_id });
            
            if (order && order.status !== "paid") {
                order.status = "paid";
                order.razorpayPaymentId = payment_id;
                await order.save();

                const user = await activateSubscription(order);
                
                // Check if transaction already exists (safety)
                const existingTx = await TransactionModel.findOne({ razorpayPaymentId: payment_id });
                if (!existingTx) {
                    // Create Transaction Record
                    await TransactionModel.create({
                        orderId: order._id,
                        userId: order.userId,
                        razorpayPaymentId: payment_id,
                        razorpayOrderId: order_id,
                        amount: order.amount,
                        currency: order.currency,
                        status: "success",
                        planName: order.planName
                    });

                    if (user) {
                        await sendPaymentEmail(user.email, user.name, order.planName, order.amount, 'success', payment_id);
                    }
                }
            }
        } else if (payload.event === "payment.failed") {
            const { order_id, id: payment_id } = payload.payload.payment.entity;
            const order = await OrderModel.findOneAndUpdate(
                { razorpayOrderId: order_id },
                { status: "failed" },
                { new: true }
            );

            if (order) {
                const user = await AuthModel.findById(order.userId);
                if (user) {
                    await sendPaymentEmail(user.email, user.name, order.planName, order.amount, 'failed', payment_id);
                }
            }
        }
        res.status(200).json({ status: "ok" });
    } else {
        res.status(400).json({ status: "invalid signature" });
    }
};

export const verifyPayment = async (req: any, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RZP_SECRET as string)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            const order = await OrderModel.findOne({ razorpayOrderId: razorpay_order_id });

            if (order && order.status !== "paid") {
                order.status = "paid";
                order.razorpayPaymentId = razorpay_payment_id;
                await order.save();

                const user = await activateSubscription(order);

                // Check if transaction already exists (idempotency)
                const existingTx = await TransactionModel.findOne({ razorpayPaymentId: razorpay_payment_id });
                if (!existingTx) {
                    // Create Transaction Record
                    await TransactionModel.create({
                        orderId: order._id,
                        userId: order.userId,
                        razorpayPaymentId: razorpay_payment_id,
                        razorpayOrderId: razorpay_order_id,
                        amount: order.amount,
                        currency: order.currency,
                        status: "success",
                        planName: order.planName
                    });

                    if (user) {
                        await sendPaymentEmail(user.email, user.name, order.planName, order.amount, 'success', razorpay_payment_id);
                    }
                }
            }

            res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            // Handle verification failure (optional: could update order to failed here too)
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserTransactions = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const transactions = await TransactionModel.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            transactions
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
