const User = require('../models/User');

const generatePracticeCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let attempt = 0; attempt < 10; attempt++) {
        const code = Array.from({ length: 6 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join('');
        const exists = await User.findOne({ practiceCode: code });
        if (!exists) return code;
    }
    throw new Error('Failed to generate unique practice code after 10 attempts');
};

module.exports = generatePracticeCode;
