const tokenTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_EMAIL: 'verifyEmail',
};

const TOKEN_EXPIRY = {
  ACCESS: {
    DEFAULT: 24 * 60, // 24 hrs
  },
  REFRESH: {
    REMEMBER_ME: 30, // 30 days
    DEFAULT: 1, // 1 day
  },
};

module.exports = {
  tokenTypes,
  TOKEN_EXPIRY,
};
