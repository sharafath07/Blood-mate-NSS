import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.resolve("uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname);

        cb(
            null,
            `students-${Date.now()}${extension}`
        );
    },
});

const fileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb
) => {
    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (extension !== ".xlsx" && extension !== ".xls") {
        cb(
            new Error(
                "Only Excel files (.xlsx or .xls) are allowed"
            )
        );

        return;
    }

    cb(null, true);
};

export const uploadExcel = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});