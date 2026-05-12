import { Router } from "express";
import { signup, Login, Logout, getMe, getSession, requestOTP, forgotPassword, resetPassword } from "./auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/send-otp", requestOTP);
authRouter.post("/signup", signup);
authRouter.post("/login", Login);
authRouter.post("/logout", Logout);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/getSession", authMiddleware, getSession);


export default authRouter;
