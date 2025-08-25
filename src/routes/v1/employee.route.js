const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const employeeController = require('../../controllers/employee.controller');
const { updateEmployeeProfileDetails } = require('../../controllers/employee.controller');
const router = express.Router();

router.post('/:id/view', auth(), employeeController.viewEmployeeProfile);
router.get('/:id', auth(), employeeController.getEmployeeProfile);
router.get('/', auth(), employeeController.searchEmployees);

router.patch('/:id/profile-details', auth(), updateEmployeeProfileDetails);

router.post('/logout', validate(authValidation.logout), authController.logoutEmployee);
module.exports = router;
