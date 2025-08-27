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

const updateCompanyDetails = catchAsync(async (req, res) => {
  const employerId = req.user.id; // assuming req.user populated via auth middleware
  const companyData = req.body;

  const company = await employerService.updateCompanyDetails(employerId, companyData);
  res.status(httpStatus.OK).json({ company, message: 'Company details saved successfully' });
});

const getCompanyDetails = catchAsync(async (req, res) => {
  const employerId = req.user.id;
  const company = await employerService.getCompanyDetails(employerId);
  res.status(httpStatus.OK).json(company);
});

module.exports = {
  register,
  login,
  logout,
  updateCompanyDetails,
  getCompanyDetails,
};
