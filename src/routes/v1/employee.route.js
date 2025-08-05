const express = require('express');
const auth = require('../../middlewares/auth');
const employeeController = require('../../controllers/employee.controller');

const router = express.Router();

router.post('/:id/view', auth(), employeeController.viewEmployeeProfile);
router.get('/:id', auth(), employeeController.getEmployeeProfile);
router.get('/', auth(), employeeController.searchEmployees);

module.exports = router;
