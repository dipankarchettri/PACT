const { Octokit } = require('@octokit/rest');
const { calculateGitHubStreaks } = require('./githubStreakService');

// Initialize Octokit with GitHub Personal Access Token
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

/**
 * Fetch GitHub user statistics
 * @param {string} username - GitHub username
 * @returns {object} GitHub stats or null if error
 */
async function fetchGitHubStats(username) {
    if (!username) return null;

    try {
        // Fetch user data
        const { data: user } = await octokit.users.getByUsername({
            username: username
        });

        // Fetch user repos to calculate stars
        const { data: repos } = await octokit.repos.listForUser({
            username: username,
            per_page: 100, // Fetch up to 100 repos
            type: 'owner' // Only repos owned by user
        });

        const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);

        // Fetch streak data which includes total contributions
        const streakData = await calculateGitHubStreaks(username);

        return {
            publicRepos: user.public_repos || 0,
            followers: user.followers || 0, // Keep followers data just in case
            stars: totalStars, // Add stars data
            totalCommits: streakData.totalContributions || 0,
            contributions: streakData.totalContributions || 0,
            currentStreak: streakData.currentStreak,
            longestStreak: streakData.longestStreak,
            submissionCalendar: streakData.submissionCalendar,
            lastUpdated: new Date()
        };
    } catch (error) {
        console.error(`Error fetching GitHub data for ${username}:`, error.message);
        return null;
    }
}

/**
 * Verify if a GitHub username exists
 * @param {string} username - GitHub username
 * @returns {boolean} true if user exists
 */
async function verifyGitHubUsername(username) {
    if (!username) return false;

    try {
        await octokit.users.getByUsername({
            username: username
        });
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    fetchGitHubStats,
    verifyGitHubUsername
};
