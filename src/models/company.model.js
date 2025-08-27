const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    website: { type: String },
    foundedIn: { type: Number },
    location: { type: String },
    type: { type: String }, // e.g., "Private", "Public", "Startup"
    revenue: { type: String },
    aboutCompany: { type: String },
    benefits: [{ type: String }],
    photos: [{ type: String }],
  },
  { timestamps: true }
);

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
