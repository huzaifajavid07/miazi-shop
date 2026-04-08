import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists (local development only)
const uploadsDir = 'uploads';
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(uploadsDir)) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (err) {
        console.warn('Could not create uploads directory:', err.message);
    }
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only! (jpg, jpeg, png, webp, gif)'));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // Normalize Windows backslashes and ensure path starts with /uploads/
    const imagePath = '/' + req.file.path.replace(/\\/g, '/');
    res.send({
        message: 'Image uploaded successfully',
        image: imagePath,
    });
});

export default router;
