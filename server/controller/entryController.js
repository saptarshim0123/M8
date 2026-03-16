const Entry = require('../models/Entry');
const User = require('../models/User');
const { encrypt, decrypt } = require('../services/encryptService');

exports.createEntry = async (req, res) => {
    const { title, text, images, tags } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'Entry text is required.' });
    }
    try {
        const newEntry = await Entry.create({
            userId: req.user._id,
            title: title || '',
            encryptedText: encrypt(text),
            images: images || [],
            tags: tags || []
        });
        const user = await User.findById(req.user._id);
        if (user) {
            user.lastEntryDate = new Date();
            await user.save();
        }
        return res.status(201).json(newEntry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEntries = async (req, res) => {
    try {
        const keyword = req.query.search
            ? { title: { $regex: req.query.search, $options: 'i' } }
            : {};
        const entries = await Entry.find({ userId: req.user._id, ...keyword })
            .select('title images tags createdAt updatedAt')
            .sort({ createdAt: -1 });
        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch entries', error: err.message });
    }
};

exports.getEntry = async (req, res) => {
    try {
        const entry = await Entry.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).select('title encryptedText images tags createdAt updatedAt');
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found or unauthorized' });
        }
        const entryObj = entry.toObject();
        entryObj.text = decrypt(entry.encryptedText);
        delete entryObj.encryptedText;
        res.status(200).json(entryObj);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch entry', error: err.message });
    }
};

exports.updateEntry = async (req, res) => {
    try {
        const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id });
        if (!entry) return res.status(404).json({ message: 'Entry not found or unauthorized' });
        entry.title = req.body.title ?? entry.title;
        entry.encryptedText = req.body.text ? encrypt(req.body.text) : entry.encryptedText;
        entry.tags = req.body.tags ?? entry.tags;
        entry.images = req.body.images ?? entry.images;
        await entry.save();
        const entryObj = entry.toObject();
        entryObj.text = decrypt(entry.encryptedText);
        delete entryObj.encryptedText;
        res.status(200).json(entryObj);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteEntry = async (req, res) => {
    try {
        const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id });
        if (!entry) return res.status(404).json({ message: 'Entry not found!' });
        await entry.deleteOne();
        res.status(200).json({ message: 'Entry deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};