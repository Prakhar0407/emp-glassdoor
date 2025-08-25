const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const employerService = require('../services/employer.service');

const register = catchAsync(async (req, res) => {
  const { user, tokens } = await employerService.registerEmployer(req.body);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await employerService.loginEmployer(email, password);
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
