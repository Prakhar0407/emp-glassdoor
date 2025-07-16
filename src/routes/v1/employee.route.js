const express = require('express');
const auth = require('../../middlewares/auth');
const employeeController = require('../../controllers/employee.controller');

const router = express.Router();

router.get('/:id', auth(), employeeController.getEmployeeProfile);
router.post('/:id/view', auth(), employeeController.viewEmployeeProfile);
router.get('/', auth(), employeeController.searchEmployees);

module.exports = router;
