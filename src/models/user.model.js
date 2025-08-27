const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    profileViews: {
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

    employmentStatus: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    employer: { type: String, default: '' },
    location: { type: String, default: '' },
    primaryIndustry: { type: String, default: '' },
    specialization: { type: String, default: '' },
    skills: {
      type: [String],
      default: [],
    },
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
