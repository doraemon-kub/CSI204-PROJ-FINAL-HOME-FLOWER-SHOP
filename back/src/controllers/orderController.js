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
        status: 'กำ ลังตรวจสอบการชำ ระเงิน', // "Verifying payment" as per wireframe
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
    getOrderById
};
