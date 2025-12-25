const { LeetCode } = require('leetcode-query');

// Initialize LeetCode client
const leetcode = new LeetCode();

/**
 * Fetch LeetCode user statistics using leetcode-query package
 * @param {string} username - LeetCode username
 * @returns {object} LeetCode stats or null if error
 */
async function fetchLeetCodeStats(username) {
    if (!username) return null;

    try {
        // Fetch user profile
        const user = await leetcode.user(username);

        if (!user) {
            throw new Error('User not found');
        }

        // Extract solved problems count
        const totalSolved = user.matchedUser?.submitStats?.acSubmissionNum?.find(
            item => item.difficulty === 'All'
        )?.count || 0;

        const easySolved = user.matchedUser?.submitStats?.acSubmissionNum?.find(
            item => item.difficulty === 'Easy'
        )?.count || 0;

        const mediumSolved = user.matchedUser?.submitStats?.acSubmissionNum?.find(
            item => item.difficulty === 'Medium'
        )?.count || 0;

        const hardSolved = user.matchedUser?.submitStats?.acSubmissionNum?.find(
            item => item.difficulty === 'Hard'
        )?.count || 0;

        // Parse language stats
        const languages = {};
        if (user.matchedUser?.languageProblemCount) {
            user.matchedUser.languageProblemCount.forEach(lang => {
                languages[lang.languageName] = lang.problemsSolved;
            });
        }

        // Get ranking and contest rating
        const ranking = user.matchedUser?.profile?.ranking || 0;
        const contestRating = Math.round(user.matchedUser?.userContestRanking?.rating || 0);

        // Calculate streak from submission calendar
        let currentStreak = 0;
        let longestStreak = 0;

        try {
            const submissionCalendar = user.matchedUser?.submissionCalendar;

            if (submissionCalendar) {
                // Parse the submission calendar (it's a JSON string)
                let calendarData;
                if (typeof submissionCalendar === 'string') {
                    calendarData = JSON.parse(submissionCalendar);
                } else {
                    calendarData = submissionCalendar;
                }

                // Get dates with submissions and sort them
                const timestamps = Object.keys(calendarData).map(ts => parseInt(ts)).sort((a, b) => b - a);

                if (timestamps.length > 0) {
                    // Calculate current streak
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const todayTimestamp = Math.floor(today.getTime() / 1000);

                    console.log(`[${username}] Today timestamp: ${todayTimestamp}, Most recent: ${timestamps[0]}`);
                    console.log(`[${username}] First 5 timestamps:`, timestamps.slice(0, 5).map(ts => {
                        const date = new Date(ts * 1000);
                        return `${date.toLocaleDateString()} (${ts})`;
                    }));

                    // Check if the most recent activity is today or yesterday
                    const mostRecentDaysDiff = Math.floor((todayTimestamp - timestamps[0]) / 86400);
                    console.log(`[${username}] Days since most recent activity: ${mostRecentDaysDiff}`);

                    if (mostRecentDaysDiff <= 1) {
                        // Start counting the streak
                        currentStreak = 1;

                        // Check consecutive days
                        for (let i = 0; i < timestamps.length - 1; i++) {
                            const dayDiff = Math.floor((timestamps[i] - timestamps[i + 1]) / 86400);

                            if (i < 5) {
                                console.log(`[${username}] Comparing index ${i} to ${i + 1}: diff = ${dayDiff} days`);
                            }

                            // If exactly 1 day apart, increment streak
                            if (dayDiff === 1) {
                                currentStreak++;
                            }
                            // If same day (multiple submissions), continue
                            else if (dayDiff === 0) {
                                continue;
                            }
                            // Gap found, streak ends
                            else {
                                if (i < 10) {
                                    console.log(`[${username}] Streak broken at index ${i}, gap of ${dayDiff} days`);
                                }
                                break;
                            }
                        }

                        console.log(`[${username}] Final current streak: ${currentStreak}`);
                    } else {
                        console.log(`[${username}] No recent activity, current streak = 0`);
                    }

                    // Calculate longest streak
                    let tempStreak = 1;
                    for (let i = 0; i < timestamps.length - 1; i++) {
                        const daysDiff = Math.floor((timestamps[i] - timestamps[i + 1]) / 86400);

                        if (daysDiff === 1) {
                            tempStreak++;
                            longestStreak = Math.max(longestStreak, tempStreak);
                        } else if (daysDiff === 0) {
                            // Same day, continue
                            continue;
                        } else {
                            tempStreak = 1;
                        }
                    }
                    longestStreak = Math.max(longestStreak, tempStreak);
                }
            }

        } catch (err) {
            console.log(`Could not calculate streaks for ${username}:`, err.message);
        }

        // Extract Badges
        const badges = user.matchedUser?.badges?.map(badge => ({
            displayName: badge.displayName,
            icon: badge.icon,
            creationDate: badge.creationDate,
            id: badge.id
        })) || [];

        const activeBadge = user.matchedUser?.activeBadge ? {
            displayName: user.matchedUser.activeBadge.displayName,
            icon: user.matchedUser.activeBadge.icon,
            id: user.matchedUser.activeBadge.id
        } : null;

        return {
            totalSolved: totalSolved,
            easySolved: easySolved,
            mediumSolved: mediumSolved,
            hardSolved: hardSolved,
            ranking: ranking,
            contestRating: contestRating,
            currentStreak: currentStreak,
            longestStreak: longestStreak,
            submissionCalendar: typeof user.matchedUser?.submissionCalendar === 'string'
                ? user.matchedUser.submissionCalendar
                : JSON.stringify(user.matchedUser?.submissionCalendar || {}),
            badges: badges,
            activeBadge: activeBadge,
            languages: languages,
            lastUpdated: new Date()
        };
    } catch (error) {
        console.error(`Error fetching LeetCode data for ${username}:`, error.message);
        return null;
    }
}

/**
 * Verify if a LeetCode username exists using leetcode-query
 * @param {string} username - LeetCode username
 * @returns {boolean} true if user exists
 */
async function verifyLeetCodeUsername(username) {
    if (!username) return false;

    try {
        const user = await leetcode.user(username);
        return !!user?.matchedUser;
    } catch (error) {
        return false;
    }
}

module.exports = {
    fetchLeetCodeStats,
    verifyLeetCodeUsername
};
