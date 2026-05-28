const Analysis = require('../models/Analysis');
const Entry = require('../models/Entry');
const { analyzeEntry } = require('../services/geminiService.js');
const { decrypt } = require('../services/encryptService.js');

exports.analyzeEntry = async (req, res) => {
    const { entryId } = req.params;
    try {
        const entry = await Entry.findOne({
            _id: entryId,
            userId: req.user._id
        });

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        const existingAnalysis = await Analysis.findOne({ entryId });

        if (existingAnalysis) {
            return res.status(200).json(existingAnalysis);
        }

        const plainText = decrypt(entry.encryptedText);

        if (!plainText || plainText.trim().length === 0) {
            return res.status(400).json({
                message: 'Analysis cannot be performed on an empty entry.'
            });
        }

        const result = await analyzeEntry(plainText);

        const analysis = await Analysis.create({
            entryId,
            userId: req.user._id,
            mood: result.mood,
            intensityScore: Math.max(1, Math.min(10, Number(result.intensityScore) || 1)),
            sentimentScore: result.sentimentScore,
            aiResponse: result.aiResponse,
            copingSuggestion: result.copingSuggestion,
            distortions: result.distortions || [],
            keywords: result.keywords || [],
            tags: result.tags || [],
            crisisDetected: result.crisisDetected || false
        });

        await Entry.findByIdAndUpdate(entryId, {
            tags: result.tags || []
        });

        res.status(201).json(analysis);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAnalysis = async (req, res) => {
    const { entryId } = req.params;

    try {
        const analysis = await Analysis.findOne({
            entryId,
            userId: req.user._id
        });
        if (!analysis) {
            return res.status(404).json({ message: 'No analysis found for this entry' });
        }
        res.status(200).json(analysis);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
        console.log(err.message);
    }
};

exports.getAllAnalyses = async (req, res) => {
    try {
        const analyses = await Analysis.find({ userId: req.user._id});
        res.status(200).json(analyses);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
        console.log(err.message);
    }
}