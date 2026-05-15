"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect(process.env.DB_URL).then(() => {
    console.log("DATABASE CONNECTED ");
}).catch((err) => {
    console.log(err);
});
const redisClient_1 = __importDefault(require("./redisClient"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
redisClient_1.default.connect();
const auth_route_1 = __importDefault(require("./auth/auth.route"));
const blog_route_1 = __importDefault(require("./blog/blog.route"));
const interaction_route_1 = __importDefault(require("./interactions/interaction.route"));
const notification_route_1 = __importDefault(require("./notifications/notification.route"));
const payment_route_1 = __importDefault(require("./payment/payment.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use("/uploads", express_1.default.static("uploads"));
app.use("/api/auth", auth_route_1.default);
app.use("/api/blog", blog_route_1.default);
app.use("/api/interactions", interaction_route_1.default);
app.use("/api/notifications", notification_route_1.default);
app.use("/api/payment", payment_route_1.default);
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
