const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');

const upload = multer(); // To parse form-data for testing ease

router.post('/register', upload.none(), userController.register);
router.post('/login', upload.none(), userController.login);
router.post('/logout', upload.none(), userController.logout);

router.get('/:id', userController.getUserProfile);
router.post('/:id/addresses', upload.none(), userController.addAddress);
router.put('/:id/addresses/:addressId', upload.none(), userController.editAddress);
router.delete('/:id/addresses/:addressId', userController.deleteAddress);

module.exports = router;
