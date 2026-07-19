const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const adminOrStaffAuth = require('../middleware/adminOrStaffAuth');

// Stats endpoint is accessible by both Admin and Staff
router.get('/stats', adminOrStaffAuth, adminController.getStats);

// User management endpoints
// Staff can view and delete members, Admin can do all
router.get('/users', adminOrStaffAuth, adminController.getAllUsers);
router.delete('/users/:userId', adminOrStaffAuth, adminController.deleteUser);
router.put('/users/:userId/role', adminAuth, adminController.updateUserRole);

router.get('/logs', adminAuth, adminController.getLogs);

module.exports = router;
