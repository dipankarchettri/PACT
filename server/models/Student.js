const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    usn: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    section: {
        type: String,
        required: true,
        trim: true
    },
    batch: {
        type: Number,
        required: true
    },

    // Platform Usernames
    githubUsername: {
        type: String,
        trim: true,
        default: null
    },
    leetcodeUsername: {
        type: String,
        trim: true,
        default: null
    },
    hackerrankUsername: {
        type: String,
        trim: true,
        default: null
    },
    linkedinUrl: {
        type: String,
        trim: true,
        default: null
    },

    // Cached Platform Data
    leetcodeStats: {
        totalSolved: { type: Number, default: 0 },
        easySolved: { type: Number, default: 0 },
        mediumSolved: { type: Number, default: 0 },
        hardSolved: { type: Number, default: 0 },
        ranking: { type: Number, default: 0 },
        contestRating: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        submissionCalendar: { type: String, default: '{}' }, // Store raw JSON string
        languages: { type: Map, of: Number, default: {} },
        lastUpdated: { type: Date, default: null }
    },

    githubStats: {
        publicRepos: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        stars: { type: Number, default: 0 },
        totalCommits: { type: Number, default: 0 },
        contributions: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        submissionCalendar: { type: String, default: '{}' }, // Store raw JSON string
        lastUpdated: { type: Date, default: null }
    },

    hackerrankStats: {
        badges: { type: [String], default: [] },
        stars: { type: Map, of: Number, default: {} },
        points: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: null }
    },

    // Performance Metrics
    performanceScore: {
        type: Number,
        default: 0
    },

    // Metadata
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate performance score before saving
studentSchema.pre('save', function (next) {
    // Weighted formula for performance score

    // LeetCode Score: Problem difficulty only
    const leetcodeScore = (this.leetcodeStats.easySolved * 1) +
        (this.leetcodeStats.mediumSolved * 3) +
        (this.leetcodeStats.hardSolved * 5);

    // GitHub Score: Contributions + Stars
    const githubScore = (this.githubStats.contributions * 0.2) + (this.githubStats.stars * 5);

    // Legacy support (set to 0 since we removed HackerRank)
    const hackerrankScore = 0;

    this.performanceScore = Math.round(leetcodeScore + githubScore + hackerrankScore);
    next();
});

module.exports = mongoose.model('Student', studentSchema);
