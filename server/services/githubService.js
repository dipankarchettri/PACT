const { Octokit } = require('@octokit/rest');
const axios = require('axios');
const cheerio = require('cheerio');
const { calculateGitHubStreaks } = require('./githubStreakService');

// Initialize Octokit with GitHub Personal Access Token
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

/**
 * Scrape GitHub achievements/badges from the user's profile
 * @param {string} username - GitHub username
 * @returns {Array} Array of badge objects { displayName, icon }
 */
async function fetchGitHubBadges(username) {
    if (!username) return [];

    try {
        // Fetch the specific achievements tab
        const url = `https://github.com/${username}?tab=achievements`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(data);
        const badges = [];
        
        // Select images that look like badges. 
        // GitHub uses specific classes or structures. We target the images within the achievements list.
        // Usually found within h3 headers or specific containers.
        // A common pattern for achievements icons is img.achievement-badge-card
        
        $('img.achievement-badge-card').each((i, el) => {
            const displayName = $(el).attr('alt') || 'GitHub Badge';
            let icon = $(el).attr('src');
            
            // Ensure absolute URL
            if (icon && !icon.startsWith('http')) {
                icon = `https://github.com${icon}`;
            }
            
            // Avoid duplicates if multiple sizes exist
            if (!badges.find(b => b.displayName === displayName)) {
                badges.push({ displayName, icon });
            }
        });
        
        // Alternative selector if the tab layout is different
        if (badges.length === 0) {
             $('a[data-hovercard-type="achievement"] img').each((i, el) => {
                 const displayName = $(el).attr('alt');
                 let icon = $(el).attr('src');

                if (icon && !icon.startsWith('http')) {
                    icon = `https://github.com${icon}`;
                }

                 if (displayName && icon && !badges.find(b => b.displayName === displayName)) {
                     badges.push({ displayName, icon });
                 }
             });
        }
        
        return badges;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            // Achievements tab might not exist for some users or if they have no badges
            return [];
        }
        console.error(`Error scraping GitHub badges for ${username}:`, error.message);
        return [];
    }
}

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
        
        // Fetch Badges via scraping
        const badges = await fetchGitHubBadges(username);

        return {
            publicRepos: user.public_repos || 0,
            followers: user.followers || 0, // Keep followers data just in case
            stars: totalStars, // Add stars data
            totalCommits: streakData.totalContributions || 0,
            contributions: streakData.totalContributions || 0,
            currentStreak: streakData.currentStreak,
            longestStreak: streakData.longestStreak,
            submissionCalendar: streakData.submissionCalendar,
            badges: badges,
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
