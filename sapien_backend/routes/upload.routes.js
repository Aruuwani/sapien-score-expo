// routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../controllers/upload.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();
const storage = multer.memoryStorage();

// File size limit: 5MB max
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Only allow images and common document types
        const allowedMimes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
        }
    }
});

// Upload requires authentication
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);

module.exports = router;
