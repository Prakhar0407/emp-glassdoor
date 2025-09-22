const express = require('express');

const router = express.Router();
const moment = require('moment');
const tokenService = require('../../services/token.service');
const { tokenTypes } = require('../../config/tokens');

// Dummy user
const dummyUser = {
  id: '12345',
  role: 'employee', // or 'employer'
};

router.get('/generate-token', async (req, res) => {
  try {
    const accessTokenExpires = moment().add(tokenService.TOKEN_EXPIRY.ACCESS.DEFAULT, 'minutes');
    const token = tokenService.generateToken(dummyUser, accessTokenExpires, tokenTypes.ACCESS);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
