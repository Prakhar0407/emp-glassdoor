const mongoose = require('mongoose');

const viewLogSchema = mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    viewerType: {
      type: String,
      enum: ['employer', 'employee'],
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ViewLog = mongoose.model('ViewLog', viewLogSchema);
module.exports = ViewLog;
