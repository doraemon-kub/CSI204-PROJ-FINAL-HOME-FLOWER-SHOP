const fileDb = require('../utils/fileDb');

const adminOrStaffAuth = (req, res, next) => {
    // We expect the frontend to send the user ID in the 'x-user-id' header
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ message: 'Authentication required. Missing x-user-id header.' });
    }

    const users = fileDb.readData('users');
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(401).json({ message: 'User not found.' });
    }

    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        return res.status(403).json({ message: 'Access denied. Admin or Staff privileges required.' });
    }

    // Attach user to request for downstream use if needed
    req.user = user;
    next();
};

module.exports = adminOrStaffAuth;
