const User = require('../models/User');
const Entry = require('../models/Entry');
const Analysis = require('../models/Analysis');
const DeletedUser = require('../models/DeletedUser');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, age, specialization } = req.body;
        
        const updateData = { name, bio, age };
        if (specialization !== undefined) updateData.specialization = specialization;
        if (req.file) {
            updateData.avatar = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        console.log('req.body:', req.body)
        const { oldPassword, newPassword } = req.body;
        console.log('oldPassword:', oldPassword)
        console.log('newPassword:', newPassword)

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Both fields are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id);
        console.log('user found:', user.email)
        const isMatch = await user.matchPassword(oldPassword);
        console.log('isMatch:', isMatch)

        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        user.password = newPassword;
        await user.save(); // pre-save hook handles hashing

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await DeletedUser.create({ deletedAt: new Date() });
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};