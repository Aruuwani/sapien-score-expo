// controllers/uploadController.js
const { uploadFileToS3 } = require('../services/s3Service');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const location = await uploadFileToS3(req.file);
    res.json({ location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

module.exports = { uploadFile };
