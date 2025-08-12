const express = require('express');
const auth = require('../../middlewares/auth');
const reviewController = require('../../controllers/review.controller');
const { reportReview, approveReport } = require('../../controllers/review.controller');
const router = express.Router();

router.post('/:employeeId', auth('createReview'), reviewController.createReview);
router.get('/:employeeId', auth(), reviewController.getEmployeeReviews);
router.post('/:id/reply', auth(), reviewController.replyReview);

// router.post('/:id/report', auth(), reviewController.reportReview);

router.post('/:id/report', auth('reportReview'), reportReview);
router.post('/:id/report/decision', auth('manageReviews'), approveReport);

router.post('/:id/comment', auth(), reviewController.commentOnReview);
router.post('/:reviewId/comments/:commentIndex/reply', auth(), reviewController.replyToComment);

router.post('/:id/like', auth(), reviewController.likeReview);
router.post('/:id/unlike', auth(), reviewController.unlikeReview);

module.exports = router;
