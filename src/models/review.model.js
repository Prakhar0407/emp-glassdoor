const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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
    comments: [commentSchema],
  },

  { timestamps: true }
);

reviewSchema.index({ employee: 1, employer: 1 }, { unique: true }); // 1 review per employer
reviewSchema.plugin(toJSON);
reviewSchema.plugin(paginate);

module.exports = mongoose.model('Review', reviewSchema);
