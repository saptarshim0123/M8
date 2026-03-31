const Analysis = require('../models/Analysis');
const mongoose = require('mongoose');

exports.createGhostData = async (req, res) => {
    const moods = ['Happy', 'Anxious', 'Sad', 'Neutral'];
    for(let i = 1; i <= 10; i++) {
        await Analysis.create({
            userId: req.user._id,
            entryId: new mongoose.Types.ObjectId(),
            mood: moods[Math.floor(Math.random() * moods.length)],
            sentimentScore: (Math.random() * 2 - 1).toFixed(2), 
            intensityScore: Math.floor(Math.random() * 10) + 1,
            aiResponse: "Ghost data for testing.",
            copingSuggestion: "Keep testing!",
            createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) 
        });
    }
    res.send("10 days of ghost data created!");
};