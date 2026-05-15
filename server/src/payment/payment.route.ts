import { Router } from "express";
import { createOrder, verifyPayment, handleWebhook } from "./payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.post("/webhook", handleWebhook);

export default router;
