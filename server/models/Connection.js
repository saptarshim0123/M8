const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        therapistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'rejected'],
            default: 'pending',
        },
        chatRoomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TherapistChatRoom',
        },
    },
    { timestamps: true }
);

connectionSchema.index({ userId: 1, therapistId: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
