const User = require('../models/User.js');
const generateToken = require('../utils/generateToken.js');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../services/emailService');
const crypto = require('crypto');

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data!' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        await OTP.deleteMany({ email, type: 'twofa' });
        await OTP.create({
            email,
            otp,
            type: 'twofa',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        await sendOTPEmail(email, otp, 'twofa');

        res.status(200).json({ message: 'OTP sent to your email', email });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserProfile = async (req, res) => {
    if (req.user) {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            bio: req.user.bio,
            streak: req.user.streak,
            longestStreak: req.user.longestStreak,
            lastEntryDate: req.user.lastEntryDate,
            weeklyDigestEnabled: req.user.weeklyDigestEnabled
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If this email exists, an OTP has been sent' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();

        await OTP.deleteMany({ email, type: 'reset' });

        await OTP.create({
            email,
            otp,
            type: 'reset',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await sendOTPEmail(email, otp, 'reset');

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const otpRecord = await OTP.findOne({ email, otp, type: 'reset' });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        // Delete used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.verify2FA = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpRecord = await OTP.findOne({ email, otp, type: 'twofa' });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resendOTP = async (req, res) => {
    const { email, type } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        await OTP.deleteMany({ email, type });
        await OTP.create({
            email,
            otp,
            type,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        await sendOTPEmail(email, otp, type);

        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
        console.log(err.message);
    }
};