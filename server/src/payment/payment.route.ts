import { Router } from "express";
import { createOrder, verifyPayment, handleWebhook, getUserTransactions } from "./payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.post("/webhook", handleWebhook);
router.get("/transactions", authMiddleware, getUserTransactions);

export default router;
