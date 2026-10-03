import express from "express";
import cors from "cors";
import helmet from "helmet";

import healthRoutes from "./routes/health.routes.js";
import studentRoutes from "./routes/student.routes.js";
import importRoutes from "./routes/import.routes.js";
import bloodRequestRoutes from "./routes/blood-request.routes.js";
import donorResponseRoutes from "./routes/donor-response.routes.js";
import donorMatchingRoutes from "./routes/donor-matching.routes.js";
import donorRoutes from "./routes/donor.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
    console.log("➡️", req.method, req.url);
    next();
});


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

export default app;