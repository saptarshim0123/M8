const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChatRoom, sendMessage } = require('../controller/therapistChatController');

router.get('/:roomId', protect, getChatRoom);
router.post('/:roomId', protect, sendMessage);

module.exports = router;
