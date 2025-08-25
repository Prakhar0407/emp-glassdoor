const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { authService, userService, tokenService } = require('.');

const registerEmployer = async (userBody) => {
  const employerData = { ...userBody, role: 'employer' };
  const user = await userService.createUser(employerData);
  const tokens = await tokenService.generateAuthTokens(user);
  return { user, tokens };
};

const loginEmployer = async (email, password, rememberMe = false) => {
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  if (user.role !== 'employer') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Access denied: Not an employer');
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
