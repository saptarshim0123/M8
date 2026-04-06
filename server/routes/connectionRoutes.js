const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    connectWithTherapist,
    getMyTherapist,
    disconnectTherapist,
    toggleShareJournals,
} = require('../controller/connectionController');

router.post('/connect', protect, connectWithTherapist);
router.get('/my-therapist', protect, getMyTherapist);
router.delete('/:id', protect, disconnectTherapist);
router.put('/toggle-share', protect, toggleShareJournals);

module.exports = router;
