const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { authService, userService, tokenService, emailService } = require('.');

const registerEmployer = async (userBody) => {
  const employerData = { ...userBody, role: 'employer', isEmailVerified: false };
  const user = await userService.createUser(employerData);

  const verificationToken = await tokenService.generateVerifyEmailToken(user);

  // const tokens = await tokenService.generateAuthTokens(user);
  // return { user, tokens };

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
