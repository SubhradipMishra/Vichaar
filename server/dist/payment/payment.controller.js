"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.handleWebhook = exports.createOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const order_model_1 = require("../order/order.model");
const auth_model_1 = __importDefault(require("../auth/auth.model"));
const razorpay = new razorpay_1.default({
    key_id: process.env.RZP_KEY,
    key_secret: process.env.RZP_SECRET,
});
const PLAN_PRICES = {
    "1_month": 299,
    "6_months": 1499,
    "12_months": 2499,
};
const activateSubscription = async (order) => {
    const user = await auth_model_1.default.findById(order.userId);
    if (!user)
        return;
    const startDate = new Date();
    const endDate = new Date();
    if (order.planName === "1_month") {
        endDate.setMonth(endDate.getMonth() + 1);
    }
    else if (order.planName === "6_months") {
        endDate.setMonth(endDate.getMonth() + 6);
    }
    else if (order.planName === "12_months") {
        endDate.setFullYear(endDate.getFullYear() + 1);
    }
    await auth_model_1.default.findByIdAndUpdate(order.userId, {
        isPremium: true,
        subscriptionPlan: order.planName,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
    });
};
const createOrder = async (req, res) => {
    try {
        const { planName } = req.body;
        const amount = PLAN_PRICES[planName];
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
        await order_model_1.OrderModel.create({
            razorpayOrderId: rzpOrder.id,
            userId: req.user.id,
            planName: planName,
            amount: amount,
            currency: "INR",
            status: "pending",
        });
        res.status(200).json(rzpOrder);
    }
    catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ error: error.message });
    }
};
exports.createOrder = createOrder;
const handleWebhook = async (req, res) => {
    const secret = process.env.RZP_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto_1.default
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
    if (expectedSignature === signature) {
        const payload = req.body;
        if (payload.event === "payment.captured") {
            const { order_id, id: payment_id } = payload.payload.payment.entity;
            const order = await order_model_1.OrderModel.findOneAndUpdate({ razorpayOrderId: order_id }, { status: "paid", razorpayPaymentId: payment_id }, { new: true });
            if (order) {
                await activateSubscription(order);
            }
        }
        else if (payload.event === "payment.failed") {
            const { order_id } = payload.payload.payment.entity;
            await order_model_1.OrderModel.findOneAndUpdate({ razorpayOrderId: order_id }, { status: "failed" });
        }
        res.status(200).json({ status: "ok" });
    }
    else {
        res.status(400).json({ status: "invalid signature" });
    }
};
exports.handleWebhook = handleWebhook;
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RZP_SECRET)
            .update(body.toString())
            .digest("hex");
        if (expectedSignature === razorpay_signature) {
            const order = await order_model_1.OrderModel.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { status: "paid", razorpayPaymentId: razorpay_payment_id }, { new: true });
            if (order) {
                await activateSubscription(order);
            }
            res.status(200).json({ success: true, message: "Payment verified successfully" });
        }
        else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.verifyPayment = verifyPayment;
