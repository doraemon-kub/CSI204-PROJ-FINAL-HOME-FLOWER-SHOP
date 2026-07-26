const fileDb = require('../utils/fileDb');
const logger = require('../utils/logger');

const getLogs = (req, res) => {
    try {
        const logs = fileDb.readData('logs');
        res.json(logs);
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ message: 'Error fetching logs' });
    }
};

const getStats = (req, res) => {
    try {
        const orders = fileDb.readData('orders');
        const products = fileDb.readData('products');
        const users = fileDb.readData('users');

        // Calculate Total Sales (sum of totalAmount for paid/completed orders)
        // Adjust the logic depending on what statuses count as "sales"
        const validStatuses = ['ชำระเงินแล้ว', 'จัดส่งแล้ว', 'กำลังตรวจสอบการชำระเงิน']; 
        const totalSales = orders
            .filter(o => validStatuses.includes(o.status))
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Calculate Pending Orders
        const pendingOrdersCount = orders.filter(o => o.status === 'กำลังตรวจสอบการชำระเงิน').length;

        // Calculate Total Orders
        const totalOrdersCount = orders.length;

        // Calculate Total Products
        const totalProductsCount = products.length;

        // Calculate Total Members (excluding admins/staff)
        const totalMembersCount = users.filter(u => u.role === 'MEMBER').length;

        // Calculate Total Staff
        const totalStaffCount = users.filter(u => u.role === 'STAFF').length;

        // Calculate counts for each order status
        const statusCounts = orders.reduce((acc, order) => {
            const status = order.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        res.json({
            totalSales,
            totalOrders: totalOrdersCount,
            pendingOrders: pendingOrdersCount,
            totalProducts: totalProductsCount,
            totalMembers: totalMembersCount,
            totalStaff: totalStaffCount,
            statusCounts: statusCounts
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
};

const getAllUsers = (req, res) => {
    try {
        const users = fileDb.readData('users');
        // Remove password before returning
        const safeUsers = users.map(({ password, ...user }) => user);
        res.json(safeUsers);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

const updateUserRole = (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body; // should be 'MEMBER' or 'STAFF'

        if (!role || (role !== 'MEMBER' && role !== 'STAFF')) {
            return res.status(400).json({ message: 'Invalid role. Must be MEMBER or STAFF' });
        }

        const users = fileDb.readData('users');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent modifying the default Admin
        if (users[userIndex].role === 'ADMIN') {
            return res.status(400).json({ message: 'Cannot modify Admin role' });
        }

        users[userIndex].role = role;
        fileDb.writeData('users', users);

        const { password, ...updatedUser } = users[userIndex];
        
        // Log the action
        logger.logAction(req.user.userId || req.user.id, 'UPDATE_ROLE', `Updated role of user ${updatedUser.name} to ${role}`);

        res.json({ message: `User role updated to ${role} successfully`, user: updatedUser });
    } catch (err) {
        console.error('Error updating user role:', err);
        res.status(500).json({ message: 'Error updating user role' });
    }
};

module.exports = {
    getStats,
    getAllUsers,
    updateUserRole,
    getLogs,
    deleteUser: (req, res) => {
        try {
            const { userId } = req.params;
            const users = fileDb.readData('users');
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                return res.status(404).json({ message: 'User not found' });
            }

            const targetUser = users[userIndex];

            // Staff can only delete MEMBERs. Admins can delete MEMBERs and STAFFs.
            if (req.user.role === 'STAFF' && targetUser.role !== 'MEMBER') {
                return res.status(403).json({ message: 'Staff can only delete members' });
            }

            // Cannot delete Admin
            if (targetUser.role === 'ADMIN') {
                return res.status(403).json({ message: 'Cannot delete ADMIN' });
            }

            users.splice(userIndex, 1);
            fileDb.writeData('users', users);

            // Note: We might also want to delete their orders, carts, addresses, but for now we just delete the user account.
            
            logger.logAction(req.user.userId || req.user.id, 'DELETE_USER', `Deleted user account: ${targetUser.name} (${targetUser.email})`);

            res.json({ message: 'User deleted successfully' });
        } catch (err) {
            console.error('Error deleting user:', err);
            res.status(500).json({ message: 'Error deleting user' });
        }
    }
};
