const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { authService, userService, tokenService, emailService } = require('.');
const Company = require('../models/company.model');
const { isOfficialEmail } = require('../utils/validateEmail');

const registerEmployer = async (userBody) => {
  if (!isOfficialEmail(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please use your official company email ID.');
  }

  const employerData = { ...userBody, role: 'employer', isEmailVerified: false };
  const user = await userService.createUser(employerData);

  const verificationToken = await tokenService.generateVerifyEmailToken(user);
  await emailService.sendVerificationEmail(user.email, verificationToken);

  return { message: 'Registration successful. Please verify your email.' };
};

const loginEmployer = async (email, password, rememberMe = false) => {
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  if (user.role !== 'employer') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Access denied: Not an employer');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please verify your email first');
  }

  const tokens = await tokenService.generateAuthTokens(user, rememberMe);
  return { user, tokens };
};

const logoutEmployer = async (refreshToken) => {
  await authService.logout(refreshToken);
};

const updateCompanyDetails = async (employerId, companyBody) => {
  const employer = await userService.getUserById(employerId);
  if (!employer || employer.role !== 'employer') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Employer not found');
  }
  let company = await Company.findOne({ employer: employerId });
  if (company) {
    Object.assign(company, companyBody);
    await company.save();
  } else {
    company = await Company.create({ ...companyBody, employer: employerId });
  }

  return company;
};

const getCompanyDetails = async (employerId) => {
  const company = await Company.findOne({ employer: employerId });
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
  }
  return company;
};

module.exports = {
  registerEmployer,
  loginEmployer,
  logoutEmployer,
  updateCompanyDetails,
  getCompanyDetails,
};
