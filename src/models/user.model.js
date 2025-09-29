const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const {
  EMPLOYMENT_STATUSES,
  JOB_TITLES,
  INDUSTRIES,
  SPECIALIZATIONS,
  LOCATION_TYPES,
  LOCATIONS,
} = require('../constants/employee.constants');

const EMPLOYMENT_STATUS_LABELS = EMPLOYMENT_STATUSES.map((s) => s.label);
const JOB_TITLE_LABELS = JOB_TITLES.map((j) => j.label);
const LOCATION_TYPE_LABELS = LOCATION_TYPES.map((l) => l.label);
const LOCATION_LABELS = LOCATIONS.map((l) => l.label);
const INDUSTRY_LABELS = INDUSTRIES.map((i) => i.label);
const SPECIALIZATION_LABELS = SPECIALIZATIONS.map((s) => s.label);

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
      validate(value) {
        // password required only if manually registering, not for LinkedIn
        if (value && (!value.match(/\d/) || !value.match(/[a-zA-Z]/))) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: ['employee', 'employer', 'admin'],
      default: 'employee',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    profileViews: {
      type: Number,
      default: 0,
    },
    employerViews: {
      type: Number,
      default: 0,
    },
    employeeViews: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
    },
    headline: { type: String },

    // For LinkedIn login tracking
    linkedinId: {
      type: String,
      unique: true,
      sparse: true,
    },

    employmentStatus: {
      type: String,
      enum: EMPLOYMENT_STATUS_LABELS,
      default: '',
    },
    jobTitle: { type: String, enum: JOB_TITLE_LABELS, default: '' },
    employer: { type: String, default: '' },
    location: { type: String, enum: LOCATION_LABELS, default: '' },
    primaryIndustry: { type: String, enum: INDUSTRY_LABELS, default: '' },
    specializations: {
      type: [String],
      enum: SPECIALIZATION_LABELS,
      validate: {
        validator: (val) => val.length >= 1 && val.length <= 5,
        message: 'Select minimum 1 and maximum 5 specializations',
      },
    },
    skills: {
      type: [String],
      default: [],
    },
    workHistory: [
      {
        company: { type: String, required: true, trim: true },
        position: { type: String, required: true, trim: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        employmentType: {
          type: String,
          enum: EMPLOYMENT_STATUS_LABELS,
          default: EMPLOYMENT_STATUS_LABELS[0],
        },
        location: { type: String, enum: LOCATION_LABELS, default: '' },
        locationType: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'onsite' },
        description: { type: String, default: '' },
      },
    ],
  },

  {
    timestamps: true,
  }
);

// Plugins
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

// Email check
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

// Password match
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

// Hash password
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password') && user.password) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
