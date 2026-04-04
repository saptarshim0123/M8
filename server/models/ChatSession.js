const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        default: 'New Conversation',
    },
    messages: [messageSchema],
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

chatSessionSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
