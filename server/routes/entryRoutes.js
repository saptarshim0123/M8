const express = require('express');
const router = express.Router();

const { createEntry, getEntries, getEntry } = require('../controller/entryController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createEntry);
router.get('/', protect, getEntries);
router.get('/:id', protect, getEntry);

module.exports = router;