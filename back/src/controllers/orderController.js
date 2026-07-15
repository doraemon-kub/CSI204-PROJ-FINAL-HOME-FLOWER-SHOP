const { v4: uuidv4 } = require('uuid');
const fileDb = require('../utils/fileDb');

const checkout = (req, res) => {
    const { userId, cartItems, buyerInfo, recipientInfo, cardMessage, paymentMethod, paymentTime, totalAmount } = req.body;

    if (!userId || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Invalid checkout data' });
    }

    let paymentSlipUrl = null;
    if (req.file) {
        // If a file was uploaded, store its path (or a relative URL)
        paymentSlipUrl = `/uploads/${req.file.filename}`;
    }

    const orders = fileDb.readData('orders');
    
    // Create new order
    const newOrder = {
        orderId: `ORD-${Date.now()}`,
        userId,
        items: cartItems,
        buyerInfo: typeof buyerInfo === 'string' ? JSON.parse(buyerInfo) : buyerInfo,
        recipientInfo: typeof recipientInfo === 'string' ? JSON.parse(recipientInfo) : recipientInfo,
        cardMessage,
        payment: {
            method: paymentMethod,
            time: paymentTime,
            slipUrl: paymentSlipUrl,
            status: 'PENDING' // or 'PAID'
        },
        shippingFee: 100, // Fixed EMS fee as per wireframe
        totalAmount: Number(totalAmount),
        status: 'กำลังตรวจสอบการชำระเงิน', // "Verifying payment" as per wireframe
        trackingNumber: null,
        createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    fileDb.writeData('orders', orders);

    // Clear the user's cart after successful checkout
    const carts = fileDb.readData('carts');
    const userCart = carts.find(c => c.userId === userId);
    if (userCart) {
        userCart.items = [];
        fileDb.writeData('carts', carts);
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
        io.to(`user_${userId}`).emit('orderCreated', newOrder);
        if (userCart) {
            io.to(`user_${userId}`).emit('cartUpdated', userCart); // Also tell frontend cart is empty now
        }
    }

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
};

const getUserOrders = (req, res) => {
    const { userId } = req.params;
    const orders = fileDb.readData('orders');
    
    const userOrders = orders.filter(o => o.userId === userId);
    res.json(userOrders);
};

const getOrderById = (req, res) => {
    const { orderId } = req.params;
    const orders = fileDb.readData('orders');
    
    const order = orders.find(o => o.orderId === orderId);
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
};

module.exports = {
    checkout,
    getUserOrders,
    getOrderById,
    // Get all orders (for Admin)
    getAllOrders: (req, res) => {
        const orders = fileDb.readData('orders');
        // Sort by date descending
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(orders);
    },

    // Update order status (for Admin)
    updateOrderStatus: (req, res) => {
        const { orderId } = req.params;
        const { status, trackingNumber } = req.body;
        const orders = fileDb.readData('orders');
        
        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (status) orders[orderIndex].status = status;
        if (trackingNumber !== undefined) orders[orderIndex].trackingNumber = trackingNumber;

        fileDb.writeData('orders', orders);

        // Emit socket event if io is available in req.app
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${orders[orderIndex].userId}`).emit('orderUpdated', { orderId: orders[orderIndex].orderId, status });
        }

        res.json({ message: 'Order updated successfully', order: orders[orderIndex] });
    }
};
