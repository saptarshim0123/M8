const User = require('../models/User');
const Entry = require('../models/Entry');
const Analysis = require('../models/Analysis');
const DeletedUser = require('../models/DeletedUser');

// Helper: group documents by day for the last N days
const groupByDay = (docs, dateField, days = 30) => {
    const result = {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        result[key] = 0;
    }
    docs.forEach(doc => {
        const key = new Date(doc[dateField]).toISOString().slice(0, 10);
        if (key in result) result[key]++;
    });
    return Object.entries(result).map(([date, count]) => ({ date, count }));
};

exports.getStats = async (req, res) => {
    try {
        const [totalUsers, totalEntries, totalAnalyses] = await Promise.all([
            User.countDocuments({ role: { $ne: 'admin' } }),
            Entry.countDocuments(),
            Analysis.countDocuments(),
        ]);
        res.json({ totalUsers, totalEntries, totalAnalyses });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserGrowth = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const since = new Date();
        since.setDate(since.getDate() - days);

        const users = await User.find({ createdAt: { $gte: since }, role: { $ne: 'admin' } })
            .select('createdAt');
        res.json(groupByDay(users, 'createdAt', days));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDeletedUsers = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const since = new Date();
        since.setDate(since.getDate() - days);

        const deletions = await DeletedUser.find({ deletedAt: { $gte: since } })
            .select('deletedAt');
        res.json(groupByDay(deletions, 'deletedAt', days));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAggregatedInsights = async (req, res) => {
    try {
        const [moodDist, avgScores, topDistortions, topKeywords] = await Promise.all([
            // Mood distribution
            Analysis.aggregate([
                { $group: { _id: '$mood', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            // Average sentiment and intensity
            Analysis.aggregate([
                {
                    $group: {
                        _id: null,
                        avgSentiment: { $avg: '$sentimentScore' },
                        avgIntensity: { $avg: '$intensityScore' },
                        totalAnalyses: { $sum: 1 }
                    }
                }
            ]),
            // Top cognitive distortions
            Analysis.aggregate([
                { $unwind: '$distortions' },
                { $group: { _id: '$distortions', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 8 }
            ]),
            // Top keywords
            Analysis.aggregate([
                { $unwind: '$keywords' },
                { $group: { _id: '$keywords', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
        ]);

        res.json({
            moodDistribution: moodDist.map(m => ({ mood: m._id, count: m.count })),
            averages: avgScores[0] || { avgSentiment: 0, avgIntensity: 0, totalAnalyses: 0 },
            topDistortions: topDistortions.map(d => ({ name: d._id, count: d.count })),
            topKeywords: topKeywords.map(k => ({ name: k._id, count: k.count })),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('name email avatar createdAt streak longestStreak lastEntryDate')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id, role: { $ne: 'admin' } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        await DeletedUser.create({ deletedAt: new Date() });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
