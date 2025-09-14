const express = require('express');
const router = express.Router();
const upload = require('../../services/storageService');

// Single file upload (resume or profile photo)
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = process.env.STORAGE_TYPE === 's3' ? req.file.location : `/uploads/${req.file.filename}`;
    return res.json({ url: fileUrl });
  } catch (err) {
    return res.status(500).json({ message: 'File upload failed', error: err.message });
  }
});

// Multiple files upload (company photos)
router.post('/photos', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const urls = req.files.map((f) => (process.env.STORAGE_TYPE === 's3' ? f.location : `/uploads/${f.filename}`));
    return res.json({ urls });
  } catch (err) {
    return res.status(500).json({ message: 'Files upload failed', error: err.message });
  }
});

module.exports = router;
