const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const adminOrStaffAuth = require('../middleware/adminOrStaffAuth');

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
router.get('/tags/all', productController.getAllTags);
router.post('/tags', adminAuth, productController.addCustomTag);
router.delete('/tags/:tag', adminAuth, productController.deleteCustomTag);

router.get('/:id', productController.getProductById);

// Admin only routes
router.post('/', adminAuth, upload.any(), productController.createProduct);
router.delete('/:id', adminAuth, productController.deleteProduct);

// Admin/Staff route (Staff can only update stock, Admin can update everything)
router.put('/:id', adminOrStaffAuth, upload.any(), productController.updateProduct);

module.exports = router;
