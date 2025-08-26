const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const employerService = require('../services/employer.service');

const register = catchAsync(async (req, res) => {
  const result = await employerService.registerEmployer(req.body);
  res.status(httpStatus.CREATED).json(result);
});

const login = catchAsync(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const { user, tokens } = await employerService.loginEmployer(email, password, rememberMe);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await employerService.logoutEmployer(req.body.refreshToken);
  res.status(httpStatus.OK).send({ message: 'Logout successful' });
});

module.exports = {
  register,
  login,
  logout,
};
