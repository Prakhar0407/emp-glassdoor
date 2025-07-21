const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const employerAuthController = require('../../controllers/employerAuth.controller');

const router = express.Router();

router.post('/register', validate(authValidation.register), employerAuthController.register);
router.post('/login', validate(authValidation.login), employerAuthController.login);

module.exports = router;
