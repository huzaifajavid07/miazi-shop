import express from 'express';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Secure Signature Generation for Frontend Direct Upload
router.get('/signature', (req, res) => {
    try {
        const timestamp = Math.round((new Date()).getTime() / 1000);
        
        // This folder MUST match where the frontend tells Cloudinary it is uploading to
        const folder = req.query.folder || 'products/images';
        
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: folder,
        }, process.env.CLOUDINARY_API_SECRET);

        res.json({
            timestamp,
            signature,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });
    } catch (error) {
        console.error('Signature Generation Error:', error);
        res.status(500).json({ message: 'Failed to generate signature', error: error.message });
    }
});

// Keep the old routes around just in case someone still hits them but return a polite error or just remove them.
// Removing them forces frontend to adopt the new method instantly.

export default router;


