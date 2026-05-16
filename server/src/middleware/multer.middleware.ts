import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: "vichaar_blogs",
            format: "webp", // Convert all images to webp for optimization
            public_id: file.fieldname + "-" + Date.now(),
            transformation: [{ width: 1200, height: 630, crop: "limit" }] // Reasonable limit for blog images
        };
    },
});

const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed!"), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Increased to 10MB as Cloudinary handles resizing
    },
});
