const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const employeeService = require('../services/employee.service');

const getEmployeeProfile = catchAsync(async (req, res) => {
  const employee = await employeeService.getEmployeeProfile(req.params.id);
  if (!employee) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Employee not found' });
  }
  res.send(employee);
});

const viewEmployeeProfile = catchAsync(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: "You can't view your own profile" });
  }
  const employee = await employeeService.incrementProfileView(req.params.id, req.user.id);
  if (!employee) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Employee not found' });
  }
  res.send({ message: 'Profile view recorded' });
});

const searchEmployees = catchAsync(async (req, res) => {
  const employees = await employeeService.searchEmployees(req.query);
  res.send(employees);
});

const updateEmployeeProfileDetails = catchAsync(async (req, res) => {
  try {
    const employee = await employeeService.updateEmployeeProfile(req.params.id, req.body);
    if (!employee) {
      return res.status(httpStatus.NOT_FOUND).send({ message: 'Employee not found' });
    }
    res.send({
      message: 'Employee profile updated successfully',
      skills: employee.skills,
      workHistory: employee.workHistory,
      resume: employee.resume || null,
    });
  } catch (err) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: err.message });
  }
});

module.exports = {
  getEmployeeProfile,
  viewEmployeeProfile,
  searchEmployees,
  updateEmployeeProfileDetails,
};
