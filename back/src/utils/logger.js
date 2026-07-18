const fileDb = require('./fileDb');

const logAction = (userId, action, details) => {
    try {
        const users = fileDb.readData('users');
        const user = users.find(u => u.id === userId) || { name: 'Unknown User', role: 'SYSTEM' };

        const logs = fileDb.readData('logs') || [];
        
        const newLog = {
            id: 'LOG-' + Date.now() + Math.floor(Math.random() * 1000),
            timestamp: new Date().toISOString(),
            userId: userId,
            userName: user.name,
            userRole: user.role,
            action: action,
            details: details
        };

        // Add to beginning
        logs.unshift(newLog);

        // Keep only last 1000 logs to prevent file bloat
        if (logs.length > 1000) {
            logs.length = 1000;
        }

        fileDb.writeData('logs', logs);
    } catch (err) {
        console.error('Error logging action:', err);
    }
};

module.exports = {
    logAction
};
