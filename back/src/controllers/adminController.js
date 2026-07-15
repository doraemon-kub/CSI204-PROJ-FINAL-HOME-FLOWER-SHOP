const fileDb = require('../utils/fileDb');

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

        // Calculate Total Members (excluding admins)
        const totalMembersCount = users.filter(u => u.role === 'MEMBER').length;

        res.json({
            totalSales,
            totalOrders: totalOrdersCount,
            pendingOrders: pendingOrdersCount,
            totalProducts: totalProductsCount,
            totalMembers: totalMembersCount
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
};

module.exports = {
    getStats
};
