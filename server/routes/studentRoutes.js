const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { fetchLeetCodeStats, verifyLeetCodeUsername } = require('../services/leetcodeService');
const { fetchGitHubStats, verifyGitHubUsername } = require('../services/githubService');
// HackerRank removed - unreliable scraping

/**
 * GET /api/students
 * Get all students with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const { batch, section, search, trackedOnly } = req.query;
        let query = {};

        // Debug logging
        // require('fs').appendFileSync('debug.log', `Query params: ${JSON.stringify(req.query)}\n`);

        if (batch) query.batch = parseInt(batch);
        if (section) query.section = section;

        // Filter for students with at least one platform username if trackedOnly is requested
        if (trackedOnly === 'true') {
            query.$or = [
                { githubUsername: { $exists: true, $gt: '' } },
                { leetcodeUsername: { $exists: true, $gt: '' } }
            ];
        }

        // console.log('GET /students query:', JSON.stringify(query, null, 2)); // Debug log
        // require('fs').appendFileSync('debug.log', `Mongo Query: ${JSON.stringify(query)}\n`);

        if (search) {
            // If we already have an $or from trackedOnly, we need to combine it with search
            // This is complex in mongo simple queries. 
            // We need to use $and if query.$or already exists
            const searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { usn: { $regex: search, $options: 'i' } }
                ]
            };

            if (query.$or) {
                query = { $and: [query, searchQuery] };
            } else {
                query.$or = searchQuery.$or;
            }
        }

        const students = await Student.find(query).sort({ performanceScore: -1 });
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

/**
 * GET /api/students/:id
 * Get single student by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
});

/**
 * POST /api/students
 * Create new student with username validation
 */
router.post('/', async (req, res) => {
    try {
        const {
            name,
            usn,
            section,
            batch,
            githubUsername,
            leetcodeUsername,
            hackerrankUsername,
            linkedinUrl
        } = req.body;

        // Validate required fields
        if (!name || !usn || !section || !batch) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify platform usernames
        const validationErrors = [];

        if (githubUsername) {
            const isValid = await verifyGitHubUsername(githubUsername);
            if (!isValid) {
                validationErrors.push(`GitHub username '${githubUsername}' not found`);
            }
        }

        if (leetcodeUsername) {
            const isValid = await verifyLeetCodeUsername(leetcodeUsername);
            if (!isValid) {
                validationErrors.push(`LeetCode username '${leetcodeUsername}' not found`);
            }
        }

        // HackerRank validation removed - unreliable scraping

        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Username validation failed',
                details: validationErrors
            });
        }

        // Create new student
        const student = new Student({
            name,
            usn,
            section,
            batch,
            githubUsername,
            leetcodeUsername,
            hackerrankUsername,
            linkedinUrl
        });

        await student.save();

        // Fetch initial data in background (don't wait)
        fetchStudentData(student._id).catch(err => {
            console.error('Error fetching initial data:', err);
        });

        res.status(201).json(student);
    } catch (error) {
        console.error('Error creating student:', error);

        if (error.code === 11000) {
            return res.status(400).json({ error: 'USN already exists' });
        }

        res.status(500).json({ error: 'Failed to create student' });
    }
});

/**
 * PUT /api/students/:id
 * Update student information
 */
router.put('/:id', async (req, res) => {
    try {
        const { githubUsername, leetcodeUsername } = req.body;

        // Verify platform usernames if they are being updated
        const validationErrors = [];

        if (githubUsername) {
            // Check if it's different from potentially existing one, or just verify always
            // Verifying always is safer for data integrity
            const isValid = await verifyGitHubUsername(githubUsername);
            if (!isValid) {
                validationErrors.push(`GitHub username '${githubUsername}' not found`);
            }
        }

        if (leetcodeUsername) {
            const isValid = await verifyLeetCodeUsername(leetcodeUsername);
            if (!isValid) {
                validationErrors.push(`LeetCode username '${leetcodeUsername}' not found`);
            }
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Username validation failed',
                details: validationErrors
            });
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Fetch fresh data if usernames changed (checking body keys is a rough proxy but safe)
        if (githubUsername || leetcodeUsername) {
            fetchStudentData(student._id).catch(err => {
                console.error('Error fetching initial data after update:', err);
            });
        }

        res.json(student);
    } catch (error) {
        console.error('Error updating student:', error);

        if (error.code === 11000) {
            return res.status(400).json({ error: 'USN already exists' });
        }

        res.status(500).json({ error: 'Failed to update student' });
    }
});

/**
 * DELETE /api/students/:id
 * Delete student
 */
router.delete('/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

/**
 * POST /api/students/refresh-all
 * Trigger data refresh for all tracked students
 */
router.post('/refresh-all', async (req, res) => {
    try {
        // Find all students with at least one linked account
        const students = await Student.find({
            $or: [
                { githubUsername: { $exists: true, $gt: '' } },
                { leetcodeUsername: { $exists: true, $gt: '' } }
            ]
        });

        console.log(`Starting bulk refresh for ${students.length} students...`);

        // Process in batches to avoid overwhelming APIs
        const BATCH_SIZE = 5;
        let successCount = 0;
        let diffs = 0;

        for (let i = 0; i < students.length; i += BATCH_SIZE) {
            const batch = students.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (student) => {
                try {
                    await fetchStudentData(student._id);
                    successCount++;
                } catch (err) {
                    console.error(`Failed to refresh ${student.name}:`, err.message);
                }
            }));
        }

        res.json({
            message: 'Bulk refresh completed',
            total: students.length,
            updated: successCount
        });
    } catch (error) {
        console.error('Error in bulk refresh:', error);
        res.status(500).json({ error: 'Failed to refresh data' });
    }
});

/**
 * POST /api/students/:id/refresh
 * Manually trigger data refresh for a student
 */
router.post('/:id/refresh', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Fetch fresh data
        await fetchStudentData(student._id);

        // Get updated student
        const updatedStudent = await Student.findById(student._id);
        res.json(updatedStudent);
    } catch (error) {
        console.error('Error refreshing student data:', error);
        res.status(500).json({ error: 'Failed to refresh student data' });
    }
});

/**
 * Helper function to fetch all platform data for a student
 */
async function fetchStudentData(studentId) {
    const student = await Student.findById(studentId);
    if (!student) return;

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

    // HackerRank data fetching removed - unreliable scraping

    student.lastUpdated = new Date();
    await student.save();
}

module.exports = router;
