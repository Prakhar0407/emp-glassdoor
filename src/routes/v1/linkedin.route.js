const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/', passport.authenticate('linkedin', { session: false }));

router.get('/callback', passport.authenticate('linkedin', { session: false, failureRedirect: '/' }), (req, res) => {
  res.json({
    message: 'LinkedIn login successful',
    user: req.user,
  });
});

module.exports = router;
