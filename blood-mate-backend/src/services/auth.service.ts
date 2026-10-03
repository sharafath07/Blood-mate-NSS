import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../config/database.js";
import { UserRole } from "../generated/prisma/client.js";

interface LoginInput {
    email: string;
    password: string;
}

export async function loginUser(input: LoginInput) {
    const user = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const passwordValid = await bcrypt.compare(
        input.password,
        user.passwordHash
    );

    if (!passwordValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role,
        },
        secret,
        {
            expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as jwt.SignOptions["expiresIn"],
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}