const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['reset', 'twofa', 'register'],
        required: true
    },
    pendingData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    }
})

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;