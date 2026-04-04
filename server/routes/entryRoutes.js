const express = require('express');
const router = express.Router();

const { createEntry, getEntries, getEntry, deleteEntry, updateEntry } = require('../controller/entryController');

const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.array('images', 5), createEntry);
router.get('/', protect, getEntries);
router.get('/:id', protect, getEntry);
router.put('/:id', protect, upload.array('images', 5), updateEntry);
router.delete('/:id', protect, deleteEntry);

module.exports = router;