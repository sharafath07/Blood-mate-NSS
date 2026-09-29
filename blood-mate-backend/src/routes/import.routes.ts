import { Router } from "express";

import {
    previewStudentsExcel,
    validateStudents,
    importStudents,
} from "../controllers/import.controller.js";

import {
    uploadExcel,
} from "../middleware/upload.middleware.js";

const router = Router();

router.post(
    "/students/preview",
    uploadExcel.single("file"),
    previewStudentsExcel
);

router.post(
    "/students/validate",
    uploadExcel.single("file"),
    validateStudents
);

router.post(
    "/students",
    uploadExcel.single("file"),
    importStudents
);

export default router;