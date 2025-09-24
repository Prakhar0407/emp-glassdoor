const express = require('express');
const auth = require('../../middlewares/auth');
const notificationController = require('../../controllers/notification.controller');

const router = express.Router();

router.get('/', auth('getNotifications'), notificationController.getNotifications);
router.patch('/:id/read', auth('markNotification'), notificationController.markNotificationAsRead);

module.exports = router;
