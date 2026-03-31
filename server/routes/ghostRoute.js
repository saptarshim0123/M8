const express = require('express');
const router = express.Router();

const {createGhostData} = require('../controller/ghostController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createGhostData);

module.exports = router