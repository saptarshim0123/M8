const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        trim: true,
        default: ''
    },
    encryptedText: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        default: []
    }
},
    {
        timestamps: true
    }
);

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;