const Connection = require('../models/Connection');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Entry = require('../models/Entry');
const TherapistChatRoom = require('../models/TherapistChatRoom');
const { decrypt } = require('../services/encryptService');
const { generatePatientSummary } = require('../services/geminiService');

// Get all active patients for this therapist
exports.getPatients = async (req, res) => {
    try {
        const connections = await Connection.find({therapistId: req.user._id,status: 'active' })
            .populate('userId', 'name email avatar lastEntryDate shareRawJournals');

        const patients = [];
        for (const conn of connections) {
            const user = conn.userId;
            if (!user) continue;

            const latestAnalysis = await Analysis.findOne({ userId: user._id })
                .sort({ createdAt: -1 })
                .select('mood sentimentScore createdAt');

            patients.push({
                connectionId: conn._id,
                chatRoomId: conn.chatRoomId,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    lastEntryDate: user.lastEntryDate,
                    shareRawJournals: user.shareRawJournals,
                },
                latestMood: latestAnalysis?.mood || 'N/A',
                latestSentiment: latestAnalysis?.sentimentScore ?? null,
                lastAnalysisDate: latestAnalysis?.createdAt || null,
            });
        }

        res.json(patients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get detailed insights for a specific patient (30-day trends)
exports.getPatientDetail = async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify connection exists
        const connection = await Connection.findOne({
            therapistId: req.user._id,
            userId,
            status: 'active'
        });
        if (!connection) {
            return res.status(403).json({ message: 'No active connection with this patient' });
        }

        const user = await User.findById(userId).select('name email avatar shareRawJournals');
        if (!user) return res.status(404).json({ message: 'Patient not found' });

        // Get analyses from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const analyses = await Analysis.find({
            userId,
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: 1 });

        // Build mood trend data
        const moodTrend = analyses.map(a => ({
            date: a.createdAt,
            mood: a.mood,
            sentimentScore: a.sentimentScore,
            intensityScore: a.intensityScore,
        }));

        // Mood distribution
        const moodCounts = {};
        analyses.forEach(a => {
            moodCounts[a.mood] = (moodCounts[a.mood] || 0) + 1;
        });
        const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({ mood, count }));

        // Top keywords
        const keywordCounts = {};
        analyses.forEach(a => {
            (a.keywords || []).forEach(kw => {
                const lower = kw.toLowerCase().trim();
                if (lower) keywordCounts[lower] = (keywordCounts[lower] || 0) + 1;
            });
        });
        const topKeywords = Object.entries(keywordCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const result = {
            patient: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                shareRawJournals: user.shareRawJournals,
            },
            chatRoomId: connection.chatRoomId,
            moodTrend,
            moodDistribution,
            topKeywords,
            totalAnalyses: analyses.length,
        };

        // Only include raw journals if user has opted in
        if (user.shareRawJournals) {
            const entries = await Entry.find({
                userId,
                createdAt: { $gte: thirtyDaysAgo }
            }).sort({ createdAt: -1 }).limit(10);

            result.recentEntries = entries.map(e => ({
                _id: e._id,
                title: e.title,
                text: decrypt(e.encryptedText),
                createdAt: e.createdAt,
            }));
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Generate AI summary for a patient
exports.getPatientAISummary = async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify connection
        const connection = await Connection.findOne({
            therapistId: req.user._id,
            userId,
            status: 'active'
        });
        if (!connection) {
            return res.status(403).json({ message: 'No active connection with this patient' });
        }

        // Get recent analyses
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const analyses = await Analysis.find({
            userId,
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: -1 });

        if (analyses.length === 0) {
            return res.json({ summary: 'Not enough data to generate a summary. This patient has no recent journal analyses.' });
        }

        const summary = await generatePatientSummary(analyses);
        res.json({ summary });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get pending connection requests
exports.getConnectionRequests = async (req, res) => {
    try {
        const requests = await Connection.find({
            therapistId: req.user._id,
            status: 'pending'
        }).populate('userId', 'name email avatar');

        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Accept a connection request
exports.acceptConnection = async (req, res) => {
    try {
        const connection = await Connection.findOne({
            _id: req.params.id,
            therapistId: req.user._id,
            status: 'pending'
        });

        if (!connection) {
            return res.status(404).json({ message: 'Connection request not found' });
        }

        // Find existing chat room or create a new one (handles reconnection)
        const chatRoom = await TherapistChatRoom.findOneAndUpdate(
            { therapistId: req.user._id, userId: connection.userId },
            { $setOnInsert: { therapistId: req.user._id, userId: connection.userId, messages: [] } },
            { upsert: true, new: true }
        );

        connection.status = 'active';
        connection.chatRoomId = chatRoom._id;
        await connection.save();

        res.json({ message: 'Connection accepted', connection });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reject a connection request
exports.rejectConnection = async (req, res) => {
    try {
        const connection = await Connection.findOne({
            _id: req.params.id,
            therapistId: req.user._id,
            status: 'pending'
        });

        if (!connection) {
            return res.status(404).json({ message: 'Connection request not found' });
        }

        connection.status = 'rejected';
        await connection.save();

        res.json({ message: 'Connection rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
