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
  const reviews = await Review.find({ employee: employeeId })
    .populate('employer', 'name email')
    .populate('likes', 'name')
    .populate('comments.user', 'name email')
    .populate('reply.likes', 'name')
    .populate('reply.comments.user', 'name email');
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

  review.reply = {
    text: reply,
    createdAt: new Date(),
    likes: [],
    comments: [],
  };
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

const getReviewById = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('employer', 'name email')
    .populate('reviewLikes', 'name')
    .populate('replyLikes', 'name')
    .populate('reviewComments.user', 'name email')
    .populate('replyComments.user', 'name email');

  if (!review) {
    return res.status(404).send({ message: 'Review not found' });
  }

  res.send(review);
});

const commentOnReview = catchAsync(async (req, res) => {
  const { id: reviewId } = req.params;
  const { text } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  }

  const comment = {
    user: req.user.id,
    text,
    createdAt: new Date(),
  };

  review.comments.push(comment);
  await review.save();

  // Optionally populate user data before sending response
  await review.populate('comments.user', 'name email');

  res.send({ message: 'Comment added successfully', review });
});

const replyToComment = catchAsync(async (req, res) => {
  const { reviewId, commentIndex } = req.params;
  const { text } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  }

  const comment = review.comments[commentIndex];
  if (!comment) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Comment not found' });
  }

  comment.replies = comment.replies || [];

  comment.replies.push({
    user: req.user.id,
    text,
    createdAt: new Date(),
  });

  await review.save();

  await review.populate('comments.user', 'name email');
  await review.populate('comments.replies.user', 'name email');

  res.send({ message: 'Reply to comment added successfully', review });
});

const likeReview = catchAsync(async (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user.id;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  }

  const alreadyLiked = review.likes.includes(userId);
  if (alreadyLiked) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'You already liked this review' });
  }

  review.likes.push(userId);
  await review.save();

  await review.populate('likes', 'name email');

  res.send({
    message: 'Review liked successfully',
    totalLikes: review.likes.length,
    likedBy: review.likes,
  });
});

const unlikeReview = catchAsync(async (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user.id;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Review not found' });
  }

  review.likes = review.likes.filter((id) => id.toString() !== userId);

  await review.save();

  res.send({
    message: 'Review unliked successfully',
    totalLikes: review.likes.length,
  });
});

module.exports = {
  createReview,
  getEmployeeReviews,
  replyReview,
  reportReview,
  getReviewById,
  commentOnReview,
  replyToComment,
  likeReview,
  unlikeReview,
};
