import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../generated/prisma/client.js";
import prisma from "../config/database.js";

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: UserRole;
    };
}

export async function authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return next(new Error("JWT_SECRET is not configured"));
    let payload;
    try {
        payload = jwt.verify(authorization.substring(7), secret, { algorithms: ["HS256"] });
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    if (typeof payload !== "object" || typeof payload.userId !== "string" || typeof payload.iat !== "number") {
        return res.status(401).json({ success: false, message: "Invalid authentication token" });
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true, updatedAt: true },
    });
    if (!user || Math.floor(user.updatedAt.getTime() / 1000) > payload.iat) {
        return res.status(401).json({ success: false, message: "Sign in again to continue" });
    }
    req.user = { userId: user.id, role: user.role };
    next();
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
