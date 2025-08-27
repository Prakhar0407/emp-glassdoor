const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { authService, userService, tokenService, emailService } = require('.');
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

module.exports = {
  registerEmployer,
  loginEmployer,
  logoutEmployer,
};
