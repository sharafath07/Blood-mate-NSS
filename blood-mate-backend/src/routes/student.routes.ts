import { Router } from "express";

import {
    listStudents,
    getStudent,
    editStudent,
    createStudent,
} from "../controllers/student.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, listStudents);
router.get("/:id", authenticate, getStudent);
router.patch("/:id", authenticate, editStudent);
router.post("/", authenticate, createStudent);

export default router;