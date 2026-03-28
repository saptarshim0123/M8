const express = require('express');
const router = express.Router();
const {
    updateProfile,
    changePassword,
    deleteAccount,
    getProfile
} = require('../controller/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;