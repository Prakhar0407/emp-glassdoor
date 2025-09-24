const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notification.service');

const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  let notifications;
  if (role === 'employer') {
    notifications = await notificationService.getEmployerNotifications(userId);
  } else if (role === 'employee') {
    notifications = await notificationService.getEmployeeNotifications(userId);
  } else {
    return res.status(httpStatus.FORBIDDEN).send({ message: 'Invalid role' });
  }

  res.status(httpStatus.OK).send({ notifications });
});

const markNotificationAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notification = await notificationService.markAsRead(id, employerId);

  if (!notification) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Notification not found' });
  }

  res.status(httpStatus.OK).send({ notification });
});

module.exports = {
  getNotifications,
  markNotificationAsRead,
};
