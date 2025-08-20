const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notification.service');

const getEmployerNotifications = catchAsync(async (req, res) => {
  const employerId = req.user.id;
  const notifications = await notificationService.getNotifications(employerId);
  res.status(httpStatus.OK).send({ notifications });
});

const markNotificationAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const employerId = req.user.id;

  const notification = await notificationService.markAsRead(id, employerId);

  if (!notification) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Notification not found' });
  }

  res.status(httpStatus.OK).send({ notification });
});

module.exports = {
  getEmployerNotifications,
  markNotificationAsRead,
};
