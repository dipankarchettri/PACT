// models/SkillAnalysis.js
const mongoose = require('mongoose');

const topicStatsSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  solved: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  easy: {
    type: Number,
    default: 0
  },
  medium: {
    type: Number,
    default: 0
  },
  hard: {
    type: Number,
    default: 0
  },
  proficiency: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const problemRecommendationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  slug: String,
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, { _id: false });

const topicRecommendationSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  currentLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  targetLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  suggestedProblems: [problemRecommendationSchema]
}, { _id: false });

const skillProgressSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  topicsImproved: [String],
  problemsSolved: Number
}, { _id: false });

const skillAnalysisSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  topicBreakdown: [topicStatsSchema],
  strongAreas: [String],
  weakAreas: [String],
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  recommendations: [topicRecommendationSchema],
  progressHistory: [skillProgressSchema],
  insights: {
    mostImprovedTopic: String,
    consistencyScore: Number,
    learningVelocity: String, // 'fast', 'moderate', 'slow'
    recommendedDailyGoal: Number
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  },
  nextCalculation: Date
}, {
  timestamps: true
});

// Index for efficient queries
skillAnalysisSchema.index({ student: 1, lastCalculated: -1 });

// Method to check if analysis is stale (older than 24 hours)
skillAnalysisSchema.methods.isStale = function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.lastCalculated < oneDayAgo;
};

// Method to calculate improvement over time
skillAnalysisSchema.methods.calculateImprovement = function() {
  if (this.progressHistory.length < 2) {
    return null;
  }

  const recent = this.progressHistory[this.progressHistory.length - 1];
  const previous = this.progressHistory[0];
  
  return {
    scoreDelta: recent.overallScore - previous.overallScore,
    timeSpan: Math.floor((recent.date - previous.date) / (1000 * 60 * 60 * 24)), // days
    problemsGrowth: recent.problemsSolved - previous.problemsSolved
  };
};

// Static method to get analysis or create if doesn't exist
skillAnalysisSchema.statics.getOrCreate = async function(studentId) {
  let analysis = await this.findOne({ student: studentId });
  
  if (!analysis) {
    analysis = new this({
      student: studentId,
      topicBreakdown: [],
      strongAreas: [],
      weakAreas: [],
      recommendations: [],
      progressHistory: []
    });
    await analysis.save();
  }
  
  return analysis;
};

// Static method to update progress history
skillAnalysisSchema.statics.recordProgress = async function(studentId, scoreData) {
  const analysis = await this.getOrCreate(studentId);
  
  analysis.progressHistory.push({
    date: new Date(),
    overallScore: scoreData.overallScore,
    topicsImproved: scoreData.topicsImproved || [],
    problemsSolved: scoreData.problemsSolved || 0
  });

  // Keep only last 30 days of history
  if (analysis.progressHistory.length > 30) {
    analysis.progressHistory = analysis.progressHistory.slice(-30);
  }

  await analysis.save();
  return analysis;
};

// Virtual for proficiency level
skillAnalysisSchema.virtual('proficiencyLevel').get(function() {
  if (this.overallScore >= 80) return 'Expert';
  if (this.overallScore >= 60) return 'Proficient';
  if (this.overallScore >= 40) return 'Intermediate';
  return 'Beginner';
});

// Ensure virtuals are included in JSON
skillAnalysisSchema.set('toJSON', { virtuals: true });
skillAnalysisSchema.set('toObject', { virtuals: true });

const SkillAnalysis = mongoose.model('SkillAnalysis', skillAnalysisSchema);

module.exports = SkillAnalysis;
