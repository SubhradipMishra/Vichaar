"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAdminGuard = exports.AdminGaurd = exports.userGuard = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const token = req.cookies.AuthToken;
    if (!token) {
        return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: "Token is not valid" });
    }
};
exports.authMiddleware = authMiddleware;
const userGuard = async (req, res, next) => {
    try {
        const token = req.cookies.AuthToken;
        if (!token) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded?.role !== "user") {
            return res.status(403).json({ success: false, message: "You are not authorized to perform this action" });
        }
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: "Token is not valid" });
    }
};
exports.userGuard = userGuard;
const AdminGaurd = async (req, res, next) => {
    try {
        const token = req.cookies.AuthToken;
        if (!token) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded?.role !== "admin") {
            return res.status(403).json({ success: false, message: "You are not authorized to perform this action" });
        }
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: "Token is not valid" });
    }
};
exports.AdminGaurd = AdminGaurd;
const userAdminGuard = async (req, res, next) => {
    try {
        const token = req.cookies.AuthToken;
        if (!token) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded?.role !== "user" && decoded?.role !== "admin") {
            return res.status(403).json({ success: false, message: "You are not authorized to perform this action" });
        }
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: "Token is not valid" });
    }
};
exports.userAdminGuard = userAdminGuard;
