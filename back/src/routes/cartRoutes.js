const express = require('express');
const router = express.Router();
const multer = require('multer');
const cartController = require('../controllers/cartController');

const upload = multer(); // To parse form-data

router.get('/:userId', cartController.getCart);
router.post('/:userId/add', upload.none(), cartController.addToCart);
router.put('/:userId/update/:cartItemId', upload.none(), cartController.updateCartItemQuantity);
router.delete('/:userId/remove/:cartItemId', cartController.removeCartItem);

module.exports = router;
