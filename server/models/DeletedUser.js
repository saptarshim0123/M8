const mongoose = require('mongoose');

const deletedUserSchema = new mongoose.Schema({
    deletedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeletedUser', deletedUserSchema);
