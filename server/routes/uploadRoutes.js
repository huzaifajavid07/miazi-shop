import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for temporary local storage (before uploading to Cloudinary)
const storage = multer.diskStorage({
    destination(req, file, cb) {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

// Image Upload (Local for now, or you can switch to Cloudinary)
router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imagePath = '/' + req.file.path.replace(/\\/g, '/');
    res.send({
        message: 'Image uploaded successfully',
        image: imagePath,
    });
});

// Cloudinary Video Upload
router.post('/video', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            folder: 'products/videos',
        });

        // Delete local temp file
        fs.unlinkSync(req.file.path);

        res.send({
            message: 'Video uploaded successfully',
            videoUrl: result.secure_url,
        });
    } catch (error) {
        console.error('Cloudinary Error:', error);
        res.status(500).json({ message: 'Video upload failed', error: error.message });
    }
});

export default router;

