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

entrySchema.pre('findOneAndDelete', async function(next) {
    // 'this' refers to the query being executed. We get the _id of the entry being deleted.
    const entryId = this.getQuery()['_id']; 
    
    try {
        // We use mongoose.model('Analysis') to avoid circular dependency requires
        await mongoose.model('Analysis').deleteOne({ entryId: entryId });
        next();
    } catch (err) {
        next(err);
    }
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;