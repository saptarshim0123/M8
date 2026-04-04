const express = require('express');
const router = express.Router();

const { sendMessage, getSessions, getSession, deleteSession } = require('../controller/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/message', protect, sendMessage);
router.get('/sessions', protect, getSessions);
router.get('/session/:id', protect, getSession);
router.delete('/session/:id', protect, deleteSession);

module.exports = router;
