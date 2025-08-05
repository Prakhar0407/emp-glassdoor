const express = require('express');
const {
  linkedInCallback,
  getUser,
  // getLinkedInLocation, // ✅ Add this import
} = require('../../controllers/auth.controller');

const router = express.Router();

router.get('/callback', linkedInCallback);
router.get('/get-user', getUser);
// router.get('/location', getLinkedInLocation); 

module.exports = router;
