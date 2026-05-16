import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary";

console.log("Initializing Cloudinary Storage with Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.error("CLOUDINARY_CLOUD_NAME is missing in environment!");
        }
        return {
            folder: "vichaar_blogs",
            format: "webp",
            public_id: file.fieldname + "-" + Date.now(),
            transformation: [{ width: 1200, height: 630, crop: "limit" }]
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
