const express = require('express');
const router = express.Router();

const {analyzeEntry, getAnalysis, getAllAnalyses} = require('../controller/analyzeController');

const { protect } = require('../middleware/authMiddleware');

router.post('/:entryId', protect, analyzeEntry);
router.get('/:entryId', protect, getAnalysis);
router.get('/', protect, getAllAnalyses);

module.exports = router