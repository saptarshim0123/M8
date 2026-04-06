const TherapistChatRoom = require('../models/TherapistChatRoom');
const Connection = require('../models/Connection');

// Get chat room messages
exports.getChatRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const chatRoom = await TherapistChatRoom.findById(roomId)
            .populate('therapistId', 'name avatar')
            .populate('userId', 'name avatar');

        if (!chatRoom) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Verify user is part of this chat room
        const userId = req.user._id.toString();
        if (chatRoom.therapistId._id.toString() !== userId && chatRoom.userId._id.toString() !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(chatRoom);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Send a message (HTTP fallback — Socket.io is primary)
exports.sendMessage = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Message text is required' });
        }

        const chatRoom = await TherapistChatRoom.findById(roomId);
        if (!chatRoom) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        const userId = req.user._id.toString();
        if (chatRoom.therapistId.toString() !== userId && chatRoom.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const message = {
            senderId: req.user._id,
            text: text.trim(),
            timestamp: new Date(),
        };

        chatRoom.messages.push(message);
        await chatRoom.save();

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
