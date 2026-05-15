import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()

import mongoose from "mongoose"

mongoose.connect(process.env.DB_URL as string).then(() => {
    console.log("DATABASE CONNECTED ")
}).catch((err) => {
    console.log(err)
})

import redisClient from "./redisClient"
import cookieParser from "cookie-parser"
redisClient.connect();

import authRouter from "./auth/auth.route";
import BlogRouter from "./blog/blog.route";
import interactionRouter from "./interactions/interaction.route";
import notificationRouter from "./notifications/notification.route";
import paymentRouter from "./payment/payment.route";

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use("/uploads", express.static("uploads"));

app.use("/api/payment", paymentRouter);
app.use("/api/auth", authRouter);
app.use("/api/blog", BlogRouter);
app.use("/api/interactions", interactionRouter);
app.use("/api/notifications", notificationRouter);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
}); 
