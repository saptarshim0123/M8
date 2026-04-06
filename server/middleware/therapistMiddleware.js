const { protect } = require('./authMiddleware');

const therapistProtect = async (req, res, next) => {
    protect(req, res, () => {
        if (req.user && req.user.role === 'therapist' && req.user.isVerified) {
            return next();
        }
        res.status(403).json({ message: 'Access denied. Verification pending.' });
    });
};

module.exports = { therapistProtect };
