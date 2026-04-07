const express = require('express');
const router = express.Router();
const { therapistProtect } = require('../middleware/therapistMiddleware');
const { getPatients, getPatientDetail, getPatientAISummary, getConnectionRequests, acceptConnection, rejectConnection, } = require('../controller/therapistController');

router.get('/patients', therapistProtect, getPatients);
router.get('/patients/:userId', therapistProtect, getPatientDetail);
router.get('/patients/:userId/summary', therapistProtect, getPatientAISummary);
router.get('/requests', therapistProtect, getConnectionRequests);
router.put('/requests/:id/accept', therapistProtect, acceptConnection);
router.put('/requests/:id/reject', therapistProtect, rejectConnection);

module.exports = router;