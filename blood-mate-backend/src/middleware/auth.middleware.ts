import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../generated/prisma/client.js";

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: UserRole;
    };
}

export function authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const token = authorization.substring(7);
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return res.status(500).json({
                success: false,
                message: "JWT_SECRET is not configured",
            });
        }

        const payload = jwt.verify(token, secret);

        if (
            typeof payload !== "object" ||
            payload === null ||
            typeof payload.userId !== "string" ||
            !Object.values(UserRole).includes(payload.role)
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }

        req.user = {
            userId: payload.userId,
            role: payload.role,
        };

        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}

export function requireRole(...roles: UserRole[]) {
    return (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions",
            });
        }

        next();
    };
}