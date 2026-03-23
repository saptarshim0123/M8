const express = require('express');
const router = express.Router();

const {analyzeEntry, getAnalysis} = require('../controller/analyzeController');

const { protect } = require('../middleware/authMiddleware');

router.post('/:entryId', protect, analyzeEntry);
router.get('/:entryId', protect, getAnalysis);

module.exports = router