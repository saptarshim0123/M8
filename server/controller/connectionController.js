const Connection = require('../models/Connection');
const User = require('../models/User');

exports.connectWithTherapist = async (req, res) => {
    try {
        const { practiceCode } = req.body;

        if (!practiceCode) {
            return res.status(400).json({ message: 'Practice code is required' });
        }

        const therapist = await User.findOne({
            practiceCode: practiceCode.toUpperCase(),
            role: 'therapist',
            isVerified: true
        });

        if (!therapist) {
            return res.status(404).json({ message: 'No verified therapist found with this code' });
        }

        if (therapist._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot connect with yourself' });
        }

        // Check if connection already exists
        const existing = await Connection.findOne({userId: req.user._id,therapistId: therapist._id,});

        if (existing) {
            if (existing.status === 'active') {
                return res.status(400).json({ message: 'You are already connected with this therapist' });
            }
            if (existing.status === 'pending') {
                return res.status(400).json({ message: 'Connection request already pending' });
            }
            // If rejected, allow re-request
            if (existing.status === 'rejected') {
                existing.status = 'pending';
                await existing.save();
                return res.json({ message: 'Connection request re-sent', connection: existing });
            }
        }

        const connection = await Connection.create({
            userId: req.user._id,
            therapistId: therapist._id,
            status: 'pending',
        });

        res.status(201).json({ message: 'Connection request sent', connection });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyTherapist = async (req, res) => {
    try {
        const connection = await Connection.findOne({
            userId: req.user._id,
            status: { $in: ['pending', 'active'] }
        }).populate('therapistId', 'name email avatar specialization practiceCode');

        if (!connection) {
            return res.json(null);
        }

        res.json({
            _id: connection._id,
            status: connection.status,
            chatRoomId: connection.chatRoomId,
            therapist: connection.therapistId,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.disconnectTherapist = async (req, res) => {
    try {
        const connection = await Connection.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!connection) {
            return res.status(404).json({ message: 'Connection not found' });
        }

        res.json({ message: 'Disconnected from therapist' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.toggleShareJournals = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.shareRawJournals = !user.shareRawJournals;
        await user.save();
        res.json({ shareRawJournals: user.shareRawJournals });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
