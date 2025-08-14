const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user.model');
const Review = require('../models/review.model');
const ViewLog = require('../models/viewLog.model');

const getEmployeeProfile = catchAsync(async (req, res) => {
  const employeeId = req.params.id;

  const employee = await User.findById(employeeId).select('-password');
  if (!employee || employee.role !== 'employee') {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Employee not found' });
  }

  const reviews = await Review.find({ employee: employeeId }).populate('employer', 'name email');

  res.send({
    id: employee.id,
    name: employee.name,
    email: employee.email,
    skills: employee.skills || [],
    profileViews: employee.profileViews || 0,
    reviews,
  });
});

const viewEmployeeProfile = catchAsync(async (req, res) => {
  const employeeId = req.params.id;

  if (employeeId === req.user.id) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: "You can't view your own profile" });
  }

  const employee = await User.findById(employeeId);
  if (!employee || employee.role !== 'employee') {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Employee not found' });
  }

  // Increase view count
  employee.profileViews = (employee.profileViews || 0) + 1;
  await employee.save();

  // Log who viewed
  await ViewLog.create({
    employee: employeeId,
    viewer: req.user.id,
  });

  res.send({ message: 'Profile view recorded' });
});

const searchEmployees = catchAsync(async (req, res) => {
  const { skills, name, email } = req.query;

  const filter = { role: 'employee' };

  if (skills) {
    const skillsArray = skills.split(',').map((s) => s.trim().toLowerCase());
    filter.skills = { $in: skillsArray };
  }

  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }

  if (email) {
    filter.email = { $regex: email, $options: 'i' };
  }

  const employees = await User.find(filter).select('-password -__v');

  res.send(employees);
});

const updateEmployeeProfileDetails = catchAsync(async (req, res) => {
  const employeeId = req.params.id;
  const { skills, workHistory, resume } = req.body;

  const employee = await User.findById(employeeId);
  if (!employee || employee.role !== 'employee') {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Employee not found' });
  }

  if (skills) {
    if (!Array.isArray(skills)) {
      return res.status(httpStatus.BAD_REQUEST).send({ message: 'Skills must be an array' });
    }
    employee.skills = skills.map((s) => s.trim().toLowerCase());
  }

  if (workHistory) {
    if (!Array.isArray(workHistory)) {
      return res.status(httpStatus.BAD_REQUEST).send({ message: 'Work history must be an array' });
    }
    employee.workHistory = workHistory;
  }

  if (resume) {
    employee.resume = resume; // You can store a URL or file path here
  }

  await employee.save();

  res.send({
    message: 'Employee profile updated successfully',
    skills: employee.skills,
    workHistory: employee.workHistory,
    resume: employee.resume || null,
  });
});

module.exports = {
  getEmployeeProfile,
  viewEmployeeProfile,
  searchEmployees,
  updateEmployeeProfileDetails,
};
