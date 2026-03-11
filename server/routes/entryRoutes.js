const express = require('express');
const router = express.Router();

const { createEntry, getEntries, getEntry, deleteEntry, updateEntry } = require('../controller/entryController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createEntry);
router.get('/', protect, getEntries);
router.get('/:id', protect, getEntry);
router.put('/:id', protect, updateEntry);
router.delete('/:id', protect, deleteEntry);

module.exports = router;