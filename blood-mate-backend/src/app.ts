import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import studentRoutes from "./routes/student.routes.js";
import importRoutes from "./routes/import.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/import", importRoutes);

export default app;