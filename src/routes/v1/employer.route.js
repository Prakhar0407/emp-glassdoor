const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const employerController = require('../../controllers/employer.controller');

const router = express.Router();

router.post('/register', validate(authValidation.register), employerController.register);
router.post('/login', validate(authValidation.login), employerController.login);
router.post('/logout', validate(authValidation.logout), employerController.logout);

module.exports = router;
