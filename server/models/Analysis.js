const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    entryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entry',
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mood: {
        type: String,
        enum: ['Happy', 'Sad', 'Anxious', 'Angry', 'Neutral', 'Mixed'],
        required: true
    },
    intensityScore: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    aiResponse: {
        type: String,
        required: true
    },
    copingSuggestion: {
        type: String,
        required: true
    },
    distortions: {
        type: [String],
        default: []
    },
    keywords: {
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        default: []
    },
    crisisDetected: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Analysis = mongoose.model('Analysis', analysisSchema)
module.exports = Analysis