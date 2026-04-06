const Entry = require('../models/Entry');
const User = require('../models/User');
const { encrypt, decrypt } = require('../services/encryptService');

exports.createEntry = async (req, res) => {
    let { title, text, tags } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'Entry text is required.' });
    }
    
    // Parse tags if sent via FormData
    if (typeof tags === 'string') {
        try {
            tags = JSON.parse(tags);
        } catch {
            tags = tags.split(',').map(t => t.trim());
        }
    }

    const uploadedImages = req.files ? req.files.map(file => file.path) : [];

    try {
        const newEntry = await Entry.create({
            userId: req.user._id,
            title: title || '',
            encryptedText: encrypt(text),
            images: uploadedImages,
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
        const { search, tag, sort } = req.query;

        const filter = { userId: req.user._id };
        if (search) filter.title = { $regex: search, $options: 'i' };
        if (tag) filter.tags = tag;

        const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

        const entries = await Entry.find(filter)
            .select('title images tags createdAt updatedAt')
            .sort(sortOrder);
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
        
        let { title, text, tags, existingImages } = req.body;

        if (typeof tags === 'string') {
            try { tags = JSON.parse(tags); } catch { tags = tags.split(',').map(t => t.trim()); }
        }
        
        if (typeof existingImages === 'string') {
            try { existingImages = JSON.parse(existingImages); } catch { existingImages = []; }
        } else if (!existingImages) {
            existingImages = [];
        }

        const newUploadedImages = req.files ? req.files.map(file => file.path) : [];
        const combinedImages = [...existingImages, ...newUploadedImages];

        entry.title = title ?? entry.title;
        entry.encryptedText = text ? encrypt(text) : entry.encryptedText;
        entry.tags = tags ?? entry.tags;
        entry.images = combinedImages.length > 0 ? combinedImages : entry.images;
        
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