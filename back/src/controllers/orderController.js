const { v4: uuidv4 } = require('uuid');
const fileDb = require('../utils/fileDb');
const logger = require('../utils/logger');
const fs = require('fs');

const checkout = (req, res) => {
    const { userId, cartItems, buyerInfo, recipientInfo, cardMessage, paymentMethod, paymentTime, totalAmount } = req.body;

    if (!userId || !cartItems || cartItems.length === 0) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: 'Invalid checkout data' });
    }

    let paymentSlipUrl = null;
    if (req.file) {
        // If a file was uploaded, store its path (or a relative URL)
        paymentSlipUrl = `/uploads/${req.file.filename}`;
    }

    const products = fileDb.readData('products');
    
    // Check stock for all items
    let parsedCartItems = typeof cartItems === 'string' ? JSON.parse(cartItems) : cartItems;
    for (const item of parsedCartItems) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            if (product.stock < item.quantity) {
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({ message: `สินค้า ${product.name} มีสต๊อกไม่เพียงพอ (เหลือ ${product.stock} ชิ้น)` });
            }
        }
    }

    // Deduct stock
    for (const item of parsedCartItems) {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
            products[productIndex].stock -= item.quantity;
        }
    }
    fileDb.writeData('products', products);

    const orders = fileDb.readData('orders');
    
    // Create new order
    const parsedBuyerInfo = typeof buyerInfo === 'string' ? JSON.parse(buyerInfo) : buyerInfo;
    const newOrder = {
        orderId: `ORD-${Date.now()}`,
        userId,
        items: cartItems,
        buyerInfo: parsedBuyerInfo,
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

    // Save refund account to user profile if provided and not already saved
    if (parsedBuyerInfo.refundAccount) {
        const users = fileDb.readData('users');
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            if (!users[userIndex].refundAccounts) {
                users[userIndex].refundAccounts = [];
            }
            if (!users[userIndex].refundAccounts.includes(parsedBuyerInfo.refundAccount)) {
                users[userIndex].refundAccounts.push(parsedBuyerInfo.refundAccount);
                fileDb.writeData('users', users);
            }
        }
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
        io.to(`user_${userId}`).emit('orderCreated', newOrder);
        if (userCart) {
            io.to(`user_${userId}`).emit('cartUpdated', userCart); // Also tell frontend cart is empty now
        }
        
        // Notify admin about the new order
        io.to('admin_room').emit('newOrderToAdmin', newOrder);
    }

    // Log action
    logger.logAction(userId, 'CREATE_ORDER', `Placed new order ${newOrder.orderId}`);

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

    updateOrderStatus: (req, res) => {
        const { orderId } = req.params;
        const { status, trackingNumber } = req.body;
        const orders = fileDb.readData('orders');
        
        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const currentStatus = orders[orderIndex].status;

        // If status changes to a cancelled state, return stock
        if (status && (status === 'ยกเลิก' || status === 'รอคืนเงิน' || status === 'คืนเงินสำเร็จ') && 
            currentStatus !== 'ยกเลิก' && currentStatus !== 'รอคืนเงิน' && currentStatus !== 'คืนเงินสำเร็จ') {
            
            const products = fileDb.readData('products');
            const orderItems = typeof orders[orderIndex].items === 'string' 
                ? JSON.parse(orders[orderIndex].items) 
                : orders[orderIndex].items;
            for (const item of orderItems) {
                const productIndex = products.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    products[productIndex].stock += item.quantity;
                }
            }
            fileDb.writeData('products', products);
        }

        if (status) orders[orderIndex].status = status;
        if (trackingNumber !== undefined) orders[orderIndex].trackingNumber = trackingNumber;

        fileDb.writeData('orders', orders);

        // Emit socket event if io is available in req.app
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${orders[orderIndex].userId}`).emit('orderUpdated', { orderId: orders[orderIndex].orderId, status });
        }

        // Log action (req.user exists since this is an admin/staff route)
        logger.logAction(req.user.userId || req.user.id, 'UPDATE_ORDER_STATUS', `Updated status of order ${orderId} to ${status}`);

        res.json({ message: 'Order updated successfully', order: orders[orderIndex] });
    },

    // Cancel order (for Member)
    cancelOrder: (req, res) => {
        const { userId, orderId } = req.params;
        const { cancelReason } = req.body;
        const orders = fileDb.readData('orders');

        const orderIndex = orders.findIndex(o => o.orderId === orderId && o.userId === userId);
        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Order not found or unauthorized' });
        }

        const currentStatus = orders[orderIndex].status;
        const cancellableStatuses = ['กำลังตรวจสอบการชำระเงิน', 'ชำระเงินแล้ว', 'กำลังจัดเตรียมสินค้า'];

        if (!cancellableStatuses.includes(currentStatus)) {
            return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
        }

        // Return stock back to products
        const products = fileDb.readData('products');
        const orderItems = typeof orders[orderIndex].items === 'string' 
            ? JSON.parse(orders[orderIndex].items) 
            : orders[orderIndex].items;
        for (const item of orderItems) {
            const productIndex = products.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                products[productIndex].stock += item.quantity;
            }
        }
        fileDb.writeData('products', products);

        orders[orderIndex].status = 'รอคืนเงิน';
        if (cancelReason) {
            orders[orderIndex].cancelReason = cancelReason;
        }
        fileDb.writeData('orders', orders);

        // Emit socket events
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${userId}`).emit('orderUpdated', { orderId, status: 'รอคืนเงิน' });
            io.to('admin_room').emit('orderUpdated', { orderId, status: 'รอคืนเงิน' });
        }

        // Log action
        logger.logAction(userId, 'CANCEL_ORDER', `Requested cancellation for order ${orderId}. Reason: ${cancelReason || 'None'}`);

        res.json({ message: 'Order cancellation requested successfully', order: orders[orderIndex] });
    }
};
