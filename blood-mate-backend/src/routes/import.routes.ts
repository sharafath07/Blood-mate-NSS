import { Router } from "express";

import {
    previewStudentsExcel,
    validateStudents,
    importStudents,
} from "../controllers/import.controller.js";

import {
    uploadExcel,
} from "../middleware/upload.middleware.js";

import {
    authenticate,
    requireRole,
} from "../middleware/auth.middleware.js";

import { UserRole } from "../generated/prisma/client.js";

const router = Router();

router.post(
    "/students/preview",
    authenticate,
    requireRole(UserRole.ADMIN, UserRole.VOLUNTEER),
    uploadExcel.single("file"),
    previewStudentsExcel
);

router.post(
    "/students/validate",
    authenticate,
    requireRole(UserRole.ADMIN, UserRole.VOLUNTEER),
    uploadExcel.single("file"),
    validateStudents
);

router.post(
    "/students",
    authenticate,
    requireRole(UserRole.ADMIN),
    uploadExcel.single("file"),
    importStudents
);

export default router;