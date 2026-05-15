import { Router } from "express";
import { generateText, generateImagePrompt } from "./ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const aiRouter = Router();

aiRouter.post("/text", authMiddleware, generateText);
aiRouter.post("/image", authMiddleware, generateImagePrompt);

export default aiRouter;
