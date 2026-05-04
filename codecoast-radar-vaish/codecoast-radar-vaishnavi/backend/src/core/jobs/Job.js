import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: true
    },
    city: String,
    state: String
  },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' }
  },
  skills: [String],
  experience: {
    min: Number,
    max: Number
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  source: {
    type: String,
    enum: ['naukri', 'indeed', 'linkedin', 'company', 'manual'],
    required: true
  },
  sourceUrl: String,
  postedDate: {
    type: Date,
    required: true,
    index: true
  },
  scrapedDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  companyRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 3
  },
  // Calculated score for ranking
  score: {
    type: Number,
    default: 0
  },
  // NLP extracted data
  extracted: {
    requiredSkills: [String],
    preferredSkills: [String],
    responsibilities: [String],
    benefits: [String]
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
jobSchema.index({ location: '2dsphere' });
jobSchema.index({ postedDate: -1 });
jobSchema.index({ score: -1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ company: 1, postedDate: -1 });

// Calculate job score based on multiple factors
jobSchema.methods.calculateScore = function() {
  const now = new Date();
  const ageInDays = (now - this.postedDate) / (1000 * 60 * 60 * 24);
  
  // Recency score (max 30 points, decreases over time)
  const recencyScore = Math.max(0, 30 - (ageInDays * 2));
  
  // Salary score (max 40 points)
  const avgSalary = (this.salary.min + this.salary.max) / 2;
  const salaryScore = Math.min(40, (avgSalary / 1000000) * 4);
  
  // Company rating score (max 10 points)
  const ratingScore = (this.companyRating / 5) * 10;
  
  // Skills match score (max 20 points) - will be calculated per user
  const skillsScore = 20;
  
  this.score = recencyScore + salaryScore + ratingScore + skillsScore;
  return this.score;
};

// Static method to calculate user-specific score
jobSchema.statics.calculateUserScore = function(job, userSkills) {
  const jobSkillsLower = job.skills.map(s => s.toLowerCase());
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  
  const matchingSkills = userSkillsLower.filter(skill => 
    jobSkillsLower.some(js => js.includes(skill) || skill.includes(js))
  );
  
  const skillMatchPercentage = jobSkillsLower.length > 0 
    ? (matchingSkills.length / jobSkillsLower.length) * 100 
    : 0;
    
  return Math.round(skillMatchPercentage);
};

export default mongoose.model('Job', jobSchema);
