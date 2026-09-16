import { Router } from "express";
import prisma from "../config/database.js";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            success: true,
            api: "OK",
            database: "OK",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            api: "OK",
            database: "ERROR",
        });
    }
});

export default router;