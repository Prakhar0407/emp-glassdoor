const express = require('express');
const auth = require('../../middlewares/auth');
const employeeController = require('../../controllers/employee.controller');
const { updateEmployeeProfileDetails } = require('../../controllers/employee.controller');
const router = express.Router();

router.post('/:id/view', auth(), employeeController.viewEmployeeProfile);
router.get('/:id', auth(), employeeController.getEmployeeProfile);
router.get('/', auth(), employeeController.searchEmployees);

router.patch('/:id/profile-details', auth(), updateEmployeeProfileDetails);

module.exports = router;
