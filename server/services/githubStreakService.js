const axios = require('axios');

/**
 * Calculate GitHub streaks from contribution data
 * @param {string} username - GitHub username
 * @returns {object} Streak data
 */
async function calculateGitHubStreaks(username) {
    try {
        // Try the public GitHub contributions API
        const response = await axios.get(
            `https://github-contributions-api.jogruber.de/v4/${username}`,
            {
                timeout: 15000,
                headers: {
                    'User-Agent': 'EduStat-Tracker'
                }
            }
        );

        const data = response.data;

        if (!data || !data.contributions) {
            console.log(`No contribution data for ${username}`);
            return { currentStreak: 0, longestStreak: 0 };
        }

        // Extract contribution array
        const contributions = data.contributions;

        if (!Array.isArray(contributions) || contributions.length === 0) {
            return { currentStreak: 0, longestStreak: 0 };
        }

        // Sort contributions by date (oldest to newest)
        const sortedContributions = contributions.sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate current streak (working backwards from today)
        const reversedContributions = [...sortedContributions].reverse();
        let foundToday = false;

        for (let i = 0; i < reversedContributions.length; i++) {
            const contrib = reversedContributions[i];
            const contribDate = new Date(contrib.date);
            contribDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((today - contribDate) / (1000 * 60 * 60 * 24));

            // If first day and has contributions today or yesterday, start counting
            if (!foundToday && daysDiff <= 1 && contrib.count > 0) {
                foundToday = true;
                currentStreak = 1;
            } else if (foundToday && contrib.count > 0) {
                // Check if it's consecutive
                const prevContrib = reversedContributions[i - 1];
                if (prevContrib) {
                    const prevDate = new Date(prevContrib.date);
                    prevDate.setHours(0, 0, 0, 0);
                    const consecutiveDiff = Math.floor((prevDate - contribDate) / (1000 * 60 * 60 * 24));

                    if (consecutiveDiff === 1) {
                        currentStreak++;
                    } else {
                        break; // Streak broken
                    }
                } else {
                    // This case should ideally not be reached if foundToday is true and i > 0
                    break;
                }
            } else if (foundToday && contrib.count === 0) {
                break; // Streak broken by zero contribution day
            }
        }

        // Calculate longest streak ever
        for (const contrib of sortedContributions) {
            if (contrib.count > 0) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0; // Reset on zero contribution day
            }
        }

        console.log(`GitHub streaks for ${username}: current=${currentStreak}, longest=${longestStreak}`);

        // Calculate total contributions
        const totalContributions = sortedContributions.reduce((sum, contrib) => sum + contrib.count, 0);

        // Create submission calendar map
        const submissionCalendar = {};
        sortedContributions.forEach(c => {
            submissionCalendar[c.date] = c.count;
        });

        return {
            currentStreak: currentStreak,
            longestStreak: longestStreak,
            totalContributions: totalContributions,
            submissionCalendar: JSON.stringify(submissionCalendar)
        };
    } catch (error) {
        console.log(`Could not fetch GitHub streaks for ${username}:`, error.message);
        // Return 0 instead of failing
        return { currentStreak: 0, longestStreak: 0, totalContributions: 0 };
    }
}

module.exports = {
    calculateGitHubStreaks
};
