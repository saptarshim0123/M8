const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminMiddleware');
const {
    getStats,
    getUserGrowth,
    getDeletedUsers,
    getAggregatedInsights,
    getUsers,
    deleteUser,
} = require('../controller/adminController');

router.get('/stats', adminProtect, getStats);
router.get('/user-growth', adminProtect, getUserGrowth);
router.get('/user-deletions', adminProtect, getDeletedUsers);
router.get('/insights', adminProtect, getAggregatedInsights);
router.get('/users', adminProtect, getUsers);
router.delete('/users/:id', adminProtect, deleteUser);

module.exports = router;
