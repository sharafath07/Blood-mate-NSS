import { Router } from "express";
import { importStudents } from "../controllers/import.controller.js";
import { uploadExcel } from "../middleware/upload.middleware.js";

const router = Router();

router.post(
    "/students",
    uploadExcel.single("file"),
    importStudents
);

export default router;