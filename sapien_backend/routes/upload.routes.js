// routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../controllers/upload.controller');


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;
