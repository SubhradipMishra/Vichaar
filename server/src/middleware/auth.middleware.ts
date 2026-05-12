import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
    const token = req.cookies.AuthToken;

    if (!token) {
        return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token is not valid" });
    }
};

export const userGuard = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.AuthToken;

        if (!token) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        if (decoded?.role !== "user") {
            return res.status(403).json({ success: false, message: "You are not authorized to perform this action" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token is not valid" });
    }
};


export const AdminGaurd = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.AuthToken;

        if (!token) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        if (decoded?.role !== "admin") {
            return res.status(403).json({ success: false, message: "You are not authorized to perform this action" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token is not valid" });
    }
}

export const userAdminGuard = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.AuthToken;

        if (!token) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        if (decoded?.role !== "user" && decoded?.role !== "admin") {
            return res.status(403).json({ success: false, message: "You are not authorized to perform this action" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token is not valid" });
    }
}