const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: { type: String, required: true, trim: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: { type: String, required: true, trim: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    replies: [replySchema],
  },
  { _id: false } // optional: prevents auto-generating _id for each comment
);

const reviewSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    headline: { type: String, trim: true },
    comment: { type: String, trim: true },
    reply: {
      type: String,
      default: null,
    },
    reportReason: {
      type: String,
      default: null,
    },
    reportStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', null],
      default: null,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    comments: [commentSchema],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isVisible: { type: Boolean, default: true },
    concernRaisedAt: { type: Date, default: null },
    conversation: [
      {
        sender: { type: String, enum: ['employee', 'employer'] },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    deleted: { type: Boolean, default: false },
    deleteReason: { type: String, default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },

  { timestamps: true }
);

reviewSchema.index({ employee: 1, employer: 1 }, { unique: true }); // 1 review per employer
reviewSchema.plugin(toJSON);
reviewSchema.plugin(paginate);

module.exports = mongoose.model('Review', reviewSchema);
