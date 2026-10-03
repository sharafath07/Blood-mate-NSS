import { Request, Response } from "express";

import { loginUser } from "../services/auth.service.js";

export async function login(
    req: Request,
    res: Response
) {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const result = await loginUser({
            email: email.trim().toLowerCase(),
            password,
        });

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "INVALID_CREDENTIALS"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
}