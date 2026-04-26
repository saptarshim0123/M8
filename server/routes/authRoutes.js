const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const generateToken = require('../utils/generateToken');
const { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword, verify2FA, resendOTP, verifyRegistration } = require('../controller/authController');
const { uploadDocument } = require('../middleware/uploadMiddleware');

const { protect } = require('../middleware/authMiddleware');

router.post('/register', uploadDocument.single('document'), registerUser);
router.post('/verify-registration', verifyRegistration);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-2fa', verify2FA);
router.post('/resend-otp', resendOTP);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login`, session: false }),
    (req, res) => {
        const token = generateToken(req.user._id)
        const user = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            bio: req.user.bio,
            age: req.user.age,
            role: req.user.role,
            createdAt: req.user.createdAt,
            token
        }
        res.redirect(`${process.env.CLIENT_URL}/auth/google/success?data=${encodeURIComponent(JSON.stringify(user))}`)
    }
);
module.exports = router;