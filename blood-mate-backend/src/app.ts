import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import { MulterError } from "multer";

import healthRoutes from "./routes/health.routes.js";
import studentRoutes from "./routes/student.routes.js";
import importRoutes from "./routes/import.routes.js";
import bloodRequestRoutes from "./routes/blood-request.routes.js";
import donorResponseRoutes from "./routes/donor-response.routes.js";
import donorMatchingRoutes from "./routes/donor-matching.routes.js";
import donorRoutes from "./routes/donor.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";


const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
    origin: (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map((origin) => origin.trim()),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "64kb" }));


app.use("/api/health", healthRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/import", importRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/donor-responses", donorResponseRoutes);
app.use("/api/donor-matching", donorMatchingRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((_req, res) => { res.status(404).json({ success: false, message: "Endpoint not found" }); });
const handleError: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof MulterError) {
        const tooLarge = error.code === "LIMIT_FILE_SIZE";
        res.status(tooLarge ? 413 : 400).json({ success: false, message: tooLarge ? "Workbook exceeds 10 MB" : "Invalid workbook upload" });
        return;
    }
    const status = error.status === 400 || error.status === 413 ? error.status : 500;
    if (status === 500) console.error("Unhandled API error", error instanceof Error ? error.name : "");
    res.status(status).json({ success: false, message: status === 500 ? "Unexpected server error" : "Invalid request body" });
};
app.use(handleError);

export default app;
