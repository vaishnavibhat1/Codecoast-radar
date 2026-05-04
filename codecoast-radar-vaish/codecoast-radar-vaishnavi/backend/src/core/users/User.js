import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    default: ''
  },
  profile: {
    skills: [String],
    experience: {
      type: String,
      enum: ['fresher', '0-1', '1-3', '3-5', '5+'],
      default: 'fresher'
    },
    qualification: {
      type: String,
      default: 'B.Tech'
    },
    resumeUrl: String,
    location: {
      city: { type: String, default: 'Mangalore' },
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: [Number] // [longitude, latitude]
      }
    },
    preferences: {
      roles: [String],
      companies: [String],
      minSalary: Number,
      maxDistance: { type: Number, default: 50 }
    }
  },
  subscription: {
    tier: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    alertsUsed: {
      count: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now }
    }
  },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  savedSearches: [{
    name: String,
    filters: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ 'profile.location.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Reset weekly alert count
userSchema.methods.resetWeeklyAlerts = function() {
  const now = new Date();
  const lastReset = new Date(this.subscription.alertsUsed.lastReset);
  const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);
  
  if (daysSinceReset >= 7) {
    this.subscription.alertsUsed.count = 0;
    this.subscription.alertsUsed.lastReset = now;
  }
};

// Check if user can receive alerts
userSchema.methods.canReceiveAlert = function() {
  if (this.subscription.tier === 'pro') {
    return true;
  }
  
  this.resetWeeklyAlerts();
  return this.subscription.alertsUsed.count < 50;
};

export default mongoose.model('User', userSchema);
