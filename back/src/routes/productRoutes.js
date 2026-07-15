const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const adminAuth = require('../middleware/adminAuth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin routes (Protected by auth middleware)
router.post('/', adminAuth, upload.single('image'), productController.createProduct);
router.put('/:id', adminAuth, upload.single('image'), productController.updateProduct);
router.delete('/:id', adminAuth, productController.deleteProduct);

module.exports = router;
