const httpStatus = require('http-status');
const Review = require('../models/review.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');

const createReview = catchAsync(async (req, res) => {
  const { employeeId } = req.params;
  const employee = await User.findById(employeeId);

  if (!employee || employee.role !== 'employee') {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Invalid employee ID' });
  }

  const review = await Review.create({
    employee: employeeId,
    employer: req.user.id,
    rating: req.body.rating,
    headline: req.body.headline,
    comment: req.body.comment,
  });

  res.status(httpStatus.CREATED).send(review);
});

const getEmployeeReviews = catchAsync(async (req, res) => {
  const { employeeId } = req.params;
  const reviews = await Review.find({ employee: employeeId }).populate('employer', 'name email');
  res.send(reviews);
});

// Employee replies to a review
const replyReview = catchAsync(async (req, res) => {
  const reviewId = req.params.id;
  const { reply } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });

  if (review.employee.toString() !== req.user.id) {
    return res.status(httpStatus.FORBIDDEN).send({ message: 'You can only reply to your own reviews' });
  }

  review.reply = reply;
  await review.save();

  res.send({ message: 'Reply added successfully', review });
});

// Employee reports a review
const reportReview = catchAsync(async (req, res) => {
  const reviewId = req.params.id;
  const { reason } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });

  if (review.employee.toString() !== req.user.id) {
    return res.status(httpStatus.FORBIDDEN).send({ message: 'You can only report reviews written about you' });
  }

  review.isReported = true;
  review.reportReason = reason;
  await review.save();

  res.send({ message: 'Review reported successfully', review });
});

module.exports = {
  createReview,
  getEmployeeReviews,
  replyReview,
  reportReview,
};
