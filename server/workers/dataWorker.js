const cron = require('node-cron');
const Student = require('../models/Student');
const { fetchLeetCodeStats } = require('../services/leetcodeService');
const { fetchGitHubStats } = require('../services/githubService');


/**
 * Background worker to update all student data
 * Runs daily at 2:00 AM
 */
function startDataWorker() {
    // Schedule: Run every day at 2:00 AM
    // Cron format: minute hour day month dayOfWeek
    cron.schedule('0 2 * * *', async () => {
        console.log('Starting scheduled data update...');
        await updateAllStudents();
    });

    console.log('Data worker scheduled: Daily at 2:00 AM');
}

/**
 * Update data for all students
 */
async function updateAllStudents() {
    try {
        const students = await Student.find({});
        console.log(`Updating data for ${students.length} students...`);

        let successCount = 0;
        let failCount = 0;

        for (const student of students) {
            try {
                await updateStudentData(student);
                successCount++;
                console.log(`✓ Updated ${student.name} (${student.usn})`);
            } catch (error) {
                failCount++;
                console.error(`✗ Failed to update ${student.name} (${student.usn}):`, error.message);
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`Data update complete: ${successCount} succeeded, ${failCount} failed`);
    } catch (error) {
        console.error('Error in updateAllStudents:', error);
    }
}

/**
 * Update data for a single student
 */
async function updateStudentData(student) {
    // Fetch LeetCode data
    if (student.leetcodeUsername) {
        const leetcodeData = await fetchLeetCodeStats(student.leetcodeUsername);
        if (leetcodeData) {
            student.leetcodeStats = leetcodeData;
        }
    }

    // Fetch GitHub data
    if (student.githubUsername) {
        const githubData = await fetchGitHubStats(student.githubUsername);
        if (githubData) {
            student.githubStats = githubData;
        }
    }



    student.lastUpdated = new Date();
    await student.save();
}

/**
 * Manual trigger for updating all students (can be called from API)
 */
async function manualUpdateAll() {
    console.log('Manual update triggered');
    return await updateAllStudents();
}

module.exports = {
    startDataWorker,
    updateAllStudents,
    manualUpdateAll
};
