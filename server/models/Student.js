const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    avatarUrl: {
        type: String,
        default: null,
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
    linkedinUrl: {
        type: String,
        trim: true,
        default: null
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true, // Allow nulls/duplicates for nulls
        select: false // Don't return by default for privacy
    },
    otp: {
        type: String,
        select: false
    },
    otpExpires: {
        type: Date,
        select: false
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
        badges: [{
            displayName: String,
            icon: String,
            creationDate: String,
            id: String
        }],
        activeBadge: {
            displayName: String,
            icon: String,
            id: String
        },
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
        submissionCalendar: { type: Array, default: [] },
        badges: [{
            displayName: String,
            icon: String
        }],
        lastUpdated: { type: Date, default: null }
    },

    // Gamification
    badges: [{
        type: String,
        enum: ['Top Solver', 'Streak Master', 'Open Source Hero', 'Open Source Enthusiast', 'Problem Solver']
    }],



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

    this.performanceScore = Math.round(leetcodeScore + githubScore);

    // Calculate Badges (Regenerate from scratch to ensure accuracy)
    const newBadges = new Set();

    // 1. Top Solver: 100+ LeetCode problems
    if (this.leetcodeStats.totalSolved >= 100) {
        newBadges.add('Top Solver');
    }

    // 1b. Problem Solver: 50+ LeetCode problems
    if (this.leetcodeStats.totalSolved >= 50) {
        newBadges.add('Problem Solver');
    }

    // 2. Streak Master: 30+ days streak (LeetCode or GitHub)
    if (this.leetcodeStats.currentStreak >= 30 || (this.githubStats && this.githubStats.currentStreak >= 30)) {
        newBadges.add('Streak Master');
    }

    // 3. Open Source Hero: 500+ GitHub contributions
    if (this.githubStats && this.githubStats.contributions >= 500) {
        newBadges.add('Open Source Hero');
    }

    // 4. Open Source Enthusiast: 300+ GitHub contributions
    if (this.githubStats && this.githubStats.contributions >= 300) {
        newBadges.add('Open Source Enthusiast');
    }

    this.badges = Array.from(newBadges);

    next();
});

module.exports = mongoose.model('Student', studentSchema);
