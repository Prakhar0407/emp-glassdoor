const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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
  },
  { timestamps: true }
);

reviewSchema.index({ employee: 1, employer: 1 }, { unique: true }); // 1 review per employer
reviewSchema.plugin(toJSON);
reviewSchema.plugin(paginate);

module.exports = mongoose.model('Review', reviewSchema);
