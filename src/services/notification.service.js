const Notification = require('../models/notification.model');

const createNotification = async (employerId, type, message) => {
  return Notification.create({ employerId, type, message });
};

const getEmployerNotifications = async (employerId) => {
  return Notification.find({ employerId }).sort({ createdAt: -1 });
};

const getEmployeeNotifications = async (employeeId) => {
  return Notification.find({ employeeId }).sort({ createdAt: -1 });
};

const markAsRead = async (notificationId) => {
  return Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
};

module.exports = {
  createNotification,
  getEmployerNotifications,
  getEmployeeNotifications,
  markAsRead,
};
