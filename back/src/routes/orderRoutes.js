const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const orderController = require('../controllers/orderController');
const adminAuth = require('../middleware/adminAuth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'slip-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Use upload.single('paymentSlip') to handle the file upload
router.post('/checkout', upload.single('paymentSlip'), orderController.checkout);
router.get('/user/:userId', orderController.getUserOrders);
router.get('/:orderId', orderController.getOrderById);

// Admin routes
router.get('/', adminAuth, orderController.getAllOrders);
router.put('/:orderId/status', adminAuth, orderController.updateOrderStatus);

module.exports = router;
