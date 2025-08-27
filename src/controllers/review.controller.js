const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const reviewService = require('../services/review.service');
const notificationService = require('../services/notification.service');

const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.params.employeeId, req.body);

  // notification for employee
  await Notification.create({
    employeeId: req.params.employeeId,
    type: 'review',
    message: `A new review was added for you by employer with ID ${req.user.id}`,
  });

  // notification for the employer
  await Notification.create({
    employerId: req.user.id,
    type: 'review',
    message: `You wrote a review for employee with ID ${req.params.employeeId}`,
  });

  res.status(httpStatus.CREATED).send(review);
});

const getEmployeeReviews = catchAsync(async (req, res) => {
  const reviews = await reviewService.getEmployeeReviews(req.params.employeeId);
  res.send(reviews);
});

const replyReview = catchAsync(async (req, res) => {
  const review = await reviewService.replyReview(req.params.id, req.user.id, req.body.reply);
  if (!review) return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  res.send({ message: 'Reply added successfully', review });
});

const reportReview = catchAsync(async (req, res) => {
  const review = await reviewService.reportReview(req.params.id, req.user.id, req.body.reason);
  if (!review) return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  res.send({ message: 'Review report submitted and is pending admin approval', review });
});

const approveReport = catchAsync(async (req, res) => {
  const review = await reviewService.approveReport(req.params.id, req.body.action);
  if (!review) return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  res.send({ message: `Report ${req.body.action}d successfully`, review });
});

const deleteReview = catchAsync(async (req, res) => {
  const { reason } = req.body;

  if (!reason || reason.trim().length === 0) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Delete reason is required' });
  }

  const result = await reviewService.deleteReview(req.params.id, req.user.id, reason);

  if (!result) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  }

  res.send(result);
});

const getReviewById = catchAsync(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.id);
  if (!review) return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  res.send(review);
});

const commentOnReview = catchAsync(async (req, res) => {
  const review = await reviewService.commentOnReview(req.params.id, req.user.id, req.body.text);
  if (!review) return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  res.send({ message: 'Comment added successfully', review });
});

const replyToComment = catchAsync(async (req, res) => {
  const review = await reviewService.replyToComment(
    req.params.reviewId,
    req.params.commentIndex,
    req.user.id,
    req.body.text
  );
  if (!review) return res.status(httpStatus.NOT_FOUND).send({ message: 'Review or comment not found' });
  res.send({ message: 'Reply to comment added successfully', review });
});

const likeReview = catchAsync(async (req, res) => {
  const review = await reviewService.likeReview(req.params.id, req.user.id);
  if (!review) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  }

  //notification to employer
  await notificationService.createNotification(
    req.user.id, // employerId
    'like',
    `You liked a review with ID ${req.params.id}` // message
  );

  //notification to employee
  await notificationService.createNotification(
    review.employee, // employeeId
    'like',
    `Employer ${req.user.name || req.user.id} liked your review`
  );

  res.send({
    message: 'Review liked successfully',
    totalLikes: review.likes.length,
    likedBy: review.likes,
  });
});

const unlikeReview = catchAsync(async (req, res) => {
  const review = await reviewService.unlikeReview(req.params.id, req.user.id);
  if (!review) return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  res.send({ message: 'Review unliked successfully', totalLikes: review.likes.length });
});

const getEmployeeAverageRating = catchAsync(async (req, res) => {
  const result = await reviewService.getEmployeeAverageRating(req.params.employeeId);
  res.send(result);
});

const getEmployeesByAverageRating = catchAsync(async (req, res) => {
  const employees = await reviewService.getEmployeesByAverageRating();
  res.send(employees);
});

module.exports = {
  createReview,
  getEmployeeReviews,
  replyReview,
  reportReview,
  approveReport,
  deleteReview,
  getReviewById,
  commentOnReview,
  replyToComment,
  likeReview,
  unlikeReview,
  getEmployeeAverageRating,
  getEmployeesByAverageRating,
};
