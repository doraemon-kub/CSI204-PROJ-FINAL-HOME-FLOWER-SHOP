const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Apply adminAuth middleware to all routes in this file
router.use(adminAuth);

router.get('/stats', adminController.getStats);

module.exports = router;
