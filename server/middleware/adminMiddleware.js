const { protect } = require('./authMiddleware');

const adminProtect = async (req, res, next) => {
    protect(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            return next();
        }
        res.status(403).json({ message: 'Access denied: Admins only' });
    });
};

module.exports = { adminProtect };
