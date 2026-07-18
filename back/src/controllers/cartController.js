const { v4: uuidv4 } = require('uuid');
const fileDb = require('../utils/fileDb');
const logger = require('../utils/logger');

const getCart = (req, res) => {
    const { userId } = req.params;
    const carts = fileDb.readData('carts');
    
    let userCart = carts.find(c => c.userId === userId);
    if (!userCart) {
        userCart = { userId, items: [] };
    }
    
    res.json(userCart);
};

const addToCart = (req, res) => {
    const { userId } = req.params;
    const { productId, quantity, customOptions } = req.body;
    
    if (!productId || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const carts = fileDb.readData('carts');
    let userCart = carts.find(c => c.userId === userId);
    
    if (!userCart) {
        userCart = { userId, items: [] };
        carts.push(userCart);
    }

    // Simple check: if it's not custom and already in cart, just increase quantity
    let existingItem = null;
    if (!customOptions || Object.keys(customOptions).length === 0) {
        existingItem = userCart.items.find(item => item.productId === productId && !item.customOptions);
    }

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        userCart.items.push({
            cartItemId: uuidv4(),
            productId,
            quantity,
            customOptions: customOptions || null
        });
    }

    fileDb.writeData('carts', carts);
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) io.to(`user_${userId}`).emit('cartUpdated', userCart);

    logger.logAction(userId, 'ADD_TO_CART', `Added product ${productId} to cart`);

    res.json({ message: 'Item added to cart', cart: userCart });
};

const updateCartItemQuantity = (req, res) => {
    const { userId, cartItemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }

    const carts = fileDb.readData('carts');
    const userCart = carts.find(c => c.userId === userId);
    
    if (!userCart) {
        return res.status(404).json({ message: 'Cart not found' });
    }

    const item = userCart.items.find(i => i.cartItemId === cartItemId);
    if (!item) {
        return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    fileDb.writeData('carts', carts);

    // Emit real-time update
    const io = req.app.get('io');
    if (io) io.to(`user_${userId}`).emit('cartUpdated', userCart);

    logger.logAction(userId, 'UPDATE_CART', `Updated quantity of product ${item.productId} to ${quantity}`);

    res.json({ message: 'Cart updated', cart: userCart });
};

const removeCartItem = (req, res) => {
    const { userId, cartItemId } = req.params;

    const carts = fileDb.readData('carts');
    const userCart = carts.find(c => c.userId === userId);
    
    if (!userCart) {
        return res.status(404).json({ message: 'Cart not found' });
    }

    const deletedItem = userCart.items.find(i => i.cartItemId === cartItemId);
    userCart.items = userCart.items.filter(i => i.cartItemId !== cartItemId);
    fileDb.writeData('carts', carts);

    // Emit real-time update
    const io = req.app.get('io');
    if (io) io.to(`user_${userId}`).emit('cartUpdated', userCart);

    if (deletedItem) {
        logger.logAction(userId, 'REMOVE_FROM_CART', `Removed product ${deletedItem.productId} from cart`);
    }

    res.json({ message: 'Item removed from cart', cart: userCart });
};

module.exports = {
    getCart,
    addToCart,
    updateCartItemQuantity,
    removeCartItem
};
