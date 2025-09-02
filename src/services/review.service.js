const Review = require('../models/review.model');
const User = require('../models/user.model');
const httpStatus = require('http-status');

const createReview = async (employerId, employeeId, body) => {
  const employee = await User.findById(employeeId);
  if (!employee || employee.role !== 'employee') {
    const err = new Error('Invalid employee ID');
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  const wordCount = body.comment ? body.comment.trim().split(/\s+/).length : 0;
  if (wordCount < 100) {
    const err = new Error('Review comment must be at least 100 words');
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  return Review.create({
    employee: employeeId,
    employer: employerId,
    rating: body.rating,
    headline: body.headline,
    comment: body.comment,
  });
};

const getEmployeeReviews = async (employeeId) => {
  return Review.find({ employee: employeeId, deleted: false })
    .populate('employer', 'name email')
    .populate('likes', 'name')
    .populate('comments.user', 'name email')
    .populate('reply.likes', 'name')
    .populate('reply.comments.user', 'name email');
};

const replyReview = async (reviewId, userId, reply) => {
  const review = await Review.findOne({ _id: reviewId, deleted: false });
  if (!review) return null;

  if (review.employee.toString() !== userId) {
    const err = new Error('You can only reply to your own reviews');
    err.statusCode = httpStatus.FORBIDDEN;
    throw err;
  }

  review.reply = reply;
  await review.save();
  return review;
};

const reportReview = async (reviewId, userId, reason) => {
  const review = await Review.findOne({ _id: reviewId, deleted: false });
  if (!review) return null;

  if (review.employee.toString() !== userId) {
    const err = new Error('You can only report reviews written about you');
    err.statusCode = httpStatus.FORBIDDEN;
    throw err;
  }

  review.reportStatus = 'pending';
  review.reportReason = reason;
  review.reportedBy = userId;
  await review.save();
  return review;
};

const approveReport = async (reviewId, action) => {
  const review = await Review.findOne({ _id: reviewId, deleted: false });
  if (!review) return null;

  if (review.reportStatus !== 'pending') {
    const err = new Error('No pending report for this review');
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  if (action === 'approve') {
    review.reportStatus = 'approved';
    review.isReported = true;
  } else if (action === 'reject') {
    review.reportStatus = 'rejected';
    review.isReported = false;
  } else {
    const err = new Error('Invalid action');
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  await review.save();
  return review;
};

const deleteReview = async (reviewId, userId, reason) => {
  const review = await Review.findOne({ _id: reviewId, deleted: false });
  if (!review) return null;
  if (review.employee.toString() !== userId) {
    const err = new Error('You can only delete reviews written about you');
    err.statusCode = 403;
    throw err;
  }
  review.deleted = true;
  review.deleteReason = reason;
  review.deletedAt = new Date();
  review.deletedBy = userId;

  await review.save();
  return { message: 'Review deleted successfully', reviewId, reason };
};

const getReviewById = async (id) => {
  return Review.findOne({ _id: id, deleted: false })
    .populate('employer', 'name email')
    .populate('reviewLikes', 'name')
    .populate('replyLikes', 'name')
    .populate('reviewComments.user', 'name email')
    .populate('replyComments.user', 'name email');
};

const commentOnReview = async (reviewId, userId, text) => {
  const review = await Review.findOne({ _id: reviewId, deleted: false });
  if (!review) return null;

  const comment = { user: userId, text, createdAt: new Date() };
  review.comments.push(comment);
  await review.save();

  await review.populate('comments.user', 'name email');
  return review;
};

const replyToComment = async (reviewId, commentIndex, userId, text) => {
  const review = await Review.findOne({ _id: reviewId, deleted: false });
  if (!review) return null;

  const comment = review.comments[commentIndex];
  if (!comment) return null;

  comment.replies = comment.replies || [];
  comment.replies.push({ user: userId, text, createdAt: new Date() });

  await review.save();
  await review.populate('comments.user', 'name email');
  await review.populate('comments.replies.user', 'name email');
  return review;
};

const likeReview = async (reviewId, userId) => {
  const review = await Review.findOne({ _id: reviewId, deleted: false });
  if (!review) return null;

  if (review.likes.includes(userId)) {
    const err = new Error('You already liked this review');
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  review.likes.push(userId);
  await review.save();
  await review.populate('likes', 'name email');
  return review;
};

const unlikeReview = async (reviewId, userId) => {
  const review = await Review.findOne({ _id: reviewId, deleted: false });
  if (!review) return null;

  review.likes = review.likes.filter((id) => id.toString() !== userId);
  await review.save();
  return review;
};

const getEmployeeAverageRating = async (employeeId) => {
  const employee = await User.findById(employeeId);
  if (!employee || employee.role !== 'employee') {
    const err = new Error('Invalid employee ID');
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  const result = await Review.aggregate([
    { $match: { employee: employee._id, deleted: false } },
    {
      $group: {
        _id: '$employee',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (!result.length) {
    return { employeeId, name: employee.name, email: employee.email, averageRating: 0, totalReviews: 0 };
  }

  return {
    employeeId,
    name: employee.name,
    email: employee.email,
    averageRating: Math.round(result[0].averageRating * 100) / 100,
    totalReviews: result[0].totalReviews,
  };
};

const getEmployeesByAverageRating = async () => {
  return Review.aggregate([
    { $match: { deleted: false } },
    {
      $group: {
        _id: '$employee',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'employeeDetails',
      },
    },
    { $unwind: '$employeeDetails' },
    { $match: { 'employeeDetails.role': 'employee' } },
    {
      $project: {
        _id: 0,
        employeeId: '$_id',
        name: '$employeeDetails.name',
        email: '$employeeDetails.email',
        averageRating: { $round: ['$averageRating', 2] },
        totalReviews: 1,
      },
    },
    { $sort: { averageRating: -1 } },
  ]);
};

const raiseConcern = async (reviewId, userId, message) => {
  const review = await Review.findOne({ _id: reviewId, deleted: false });
  if (!review) return null;

  if (review.employee.toString() !== userId) {
    const err = new Error('You can only raise concern for reviews written about you');
    err.statusCode = httpStatus.FORBIDDEN;
    throw err;
  }

  review.isVisible = false;
  review.concernRaisedAt = new Date();
  review.conversation.push({ sender: 'employee', message });

  await review.save();
  return review;
};

const replyConcern = async (reviewId, userId, role, message) => {
  const review = await Review.findOne({ _id: reviewId, deleted: false });
  if (!review) return null;

  if (![review.employee.toString(), review.employer.toString()].includes(userId)) {
    const err = new Error('You are not allowed to reply in this conversation');
    err.statusCode = httpStatus.FORBIDDEN;
    throw err;
  }

  review.conversation.push({ sender: role, message });
  await review.save();
  return review;
};

const checkReviewConcerns = async () => {
  const reviews = await Review.find({ concernRaisedAt: { $ne: null }, isDeleted: false });

  const now = new Date();
  for (const review of reviews) {
    const daysPassed = Math.floor((now - review.concernRaisedAt) / (1000 * 60 * 60 * 24));

    if (daysPassed >= 20) {
      const lastMsg = review.conversation[review.conversation.length - 1];

      if (lastMsg?.sender === 'employee') {
        review.isVisible = true;
        review.concernRaisedAt = null;
      } else if (lastMsg?.sender === 'employer') {
        review.isDeleted = true;
      }
      await review.save();
    }
  }
};

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
  raiseConcern,
  replyConcern,
  checkReviewConcerns,
};
