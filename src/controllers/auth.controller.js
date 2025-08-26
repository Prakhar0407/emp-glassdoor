const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { authService, userService, tokenService, emailService } = require('../services');
const User = require('../models/user.model');
const fetch = require('node-fetch');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res, next) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const registerEmployer = catchAsync(async (req, res) => {
  const userBody = {
    ...req.body,
    role: 'employer',
    isEmailVerified: true,
  };

  const user = await userService.createUser(userBody);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const loginEmployer = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  if (user.role !== 'employer') {
    return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Not authorized as employer' });
  }

  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logoutEmployee = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  res.clearCookie('token');

  res.status(httpStatus.OK).send({ message: 'Employee logout successful' });
});

// LinkedIn login helpers
const getAccessToken = async (code) => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: 'http://localhost:3000/v1/linkedin/callback',
  });

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json(); // { access_token, expires_in }
};

const getUserData = async (accessToken) => {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json(); // Contains email, name, picture, etc.
};

const linkedInCallback = catchAsync(async (req, res) => {
  const { code } = req.query;

  const accessToken = await getAccessToken(code);
  const userData = await getUserData(accessToken.access_token);

  if (!userData) {
    return res.status(500).json({ success: false, message: 'Unable to fetch LinkedIn profile' });
  }

  let user = await User.findOne({ email: userData.email });

  if (!user) {
    user = await User.create({
      name: userData.name,
      email: userData.email,
      avatar: userData?.picture,
      phone: userData?.phone,
      role: userData?.role,
      headline: userData?.headline,

      isEmailVerified: true,
    });
  }

  // const token = jwt.sign(
  //   { id: user.id, name: user.name, email: user.email, avatar: user.avatar, headline: user.headline },
  //   process.env.JWT_SECRET
  // );

  const tokens = await tokenService.generateAuthTokens(user);

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      headline: user.headline,
      role: user.role,
    },
    tokens, // contains access + refresh
  });

  res.cookie('token', token, { httpOnly: true });
  res.redirect('http://localhost:5173/profile');
});

const getUser = catchAsync(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).json({ success: false });
  }

  const user = jwt.verify(token, process.env.JWT_SECRET);
  res.status(200).json({ success: true, user });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  registerEmployer,
  loginEmployer,
  logoutEmployee,
  linkedInCallback,
  getUser,
};
