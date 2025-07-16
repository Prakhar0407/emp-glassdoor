const express = require('express');
const auth = require('../../middlewares/auth');
const reviewController = require('../../controllers/review.controller');

const router = express.Router();

router.post('/:employeeId', auth('createReview'), reviewController.createReview);
router.get('/:employeeId', auth(), reviewController.getEmployeeReviews);
router.post('/:id/reply', auth(), reviewController.replyReview);
router.post('/:id/report', auth(), reviewController.reportReview);

module.exports = router;
