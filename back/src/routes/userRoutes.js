const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');

const upload = multer(); // To parse form-data for testing ease

router.post('/register', upload.none(), userController.register);
router.post('/login', upload.none(), userController.login);

module.exports = router;
