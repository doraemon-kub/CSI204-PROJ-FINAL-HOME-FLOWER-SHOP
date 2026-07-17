const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const adminOrStaffAuth = require('../middleware/adminOrStaffAuth');

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

// Admin/Staff routes (Protected by auth middleware)
router.post('/', adminOrStaffAuth, upload.single('image'), productController.createProduct);
router.put('/:id', adminOrStaffAuth, upload.single('image'), productController.updateProduct);
router.delete('/:id', adminOrStaffAuth, productController.deleteProduct);

module.exports = router;
