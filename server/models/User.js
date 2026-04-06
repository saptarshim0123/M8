const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    age: {
        type: Number
    },
    streak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastEntryDate: {
        type: Date
    },
    weeklyDigestEnabled: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
},
    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch(err) {
        next(err);
    }
});

userSchema.pre('findOneAndDelete', async function (next) {
    const userId = this.getQuery()['_id'];
    try {
        const entries = await mongoose.model('Entry').find({ userId });
        const entryIds = entries.map(e => e._id);

        await mongoose.model('Analysis').deleteMany({ entryId: { $in: entryIds } });

        await mongoose.model('Entry').deleteMany({ userId });

    } catch (err) {
        next(err);
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;