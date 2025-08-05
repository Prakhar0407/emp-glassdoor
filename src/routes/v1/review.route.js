const express = require('express');
const auth = require('../../middlewares/auth');
const reviewController = require('../../controllers/review.controller');

const router = express.Router();

router.post('/:employeeId', auth('createReview'), reviewController.createReview);
router.get('/:employeeId', auth(), reviewController.getEmployeeReviews);
router.post('/:id/reply', auth(), reviewController.replyReview);
router.post('/:id/report', auth(), reviewController.reportReview);
router.post('/:id/comment', auth(), reviewController.commentOnReview);
router.post('/:reviewId/comments/:commentIndex/reply', auth(), reviewController.replyToComment);
module.exports = router;
