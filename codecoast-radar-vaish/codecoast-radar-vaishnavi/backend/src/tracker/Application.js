import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  // Manual job entry (if not from database)
  manualEntry: {
    title: String,
    company: String,
    location: String,
    url: String
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interview', 'offer', 'rejected', 'withdrawn'],
    default: 'applied',
    index: true
  },
  appliedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  lastStatusUpdate: {
    type: Date,
    default: Date.now
  },
  statusHistory: [{
    status: String,
    date: { type: Date, default: Date.now },
    notes: String
  }],
  followUpDate: Date,
  followUpSent: {
    type: Boolean,
    default: false
  },
  responseReceived: {
    type: Boolean,
    default: false
  },
  responseDate: Date,
  notes: String,
  resumeVersion: String,
  coverLetter: String,
  interviewDates: [{
    round: String,
    date: Date,
    notes: String,
    outcome: String
  }]
}, {
  timestamps: true
});

// Indexesfor efficient queries
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, appliedDate: -1 });
applicationSchema.index({ followUpDate: 1 });

// Finite State Machine for status transitions
applicationSchema.methods.updateStatus = function(newStatus, notes = '') {
  const validTransitions = {
    'applied': ['shortlisted', 'rejected', 'withdrawn'],
    'shortlisted': ['interview', 'rejected', 'withdrawn'],
    'interview': ['offer', 'rejected', 'withdrawn'],
    'offer': ['withdrawn'],
    'rejected': [],
    'withdrawn': []
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }

  this.statusHistory.push({
    status: newStatus,
    date: new Date(),
    notes
  });

  this.status = newStatus;
  this.lastStatusUpdate = new Date();

  // Update response received flag
  if (['shortlisted', 'interview', 'offer', 'rejected'].includes(newStatus)) {
    this.responseReceived = true;
    if (!this.responseDate) {
      this.responseDate = new Date();
    }
  }

  return this;
};

// Calculate days since application
applicationSchema.virtual('daysSinceApplied').get(function() {
  return Math.floor((new Date() - this.appliedDate) / (1000 * 60 * 60 * 24));
});

// Calculate days since last update
applicationSchema.virtual('daysSinceUpdate').get(function() {
  return Math.floor((new Date() - this.lastStatusUpdate) / (1000 * 60 * 60 * 24));
});

// Check if follow-up is needed (Timeout Detection Algorithm)
applicationSchema.methods.needsFollowUp = function() {
  if (this.status === 'applied' || this.status === 'interview') {
    const daysSince = this.daysSinceUpdate;
    return !this.responseReceived && daysSince >= 7 && !this.followUpSent;
  }
  return false;
};

export default mongoose.model('Application', applicationSchema);
