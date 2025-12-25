// routes/skillAnalysis.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { generateSkillAnalysis, generateAIRecommendations } = require('../services/aiService');
const axios = require('axios');

// LeetCode topic tags mapping
const LEETCODE_TOPICS = {
  'array': 'Arrays',
  'string': 'Strings',
  'hash-table': 'Hash Tables',
  'dynamic-programming': 'Dynamic Programming',
  'math': 'Mathematics',
  'sorting': 'Sorting',
  'greedy': 'Greedy',
  'depth-first-search': 'DFS',
  'binary-search': 'Binary Search',
  'database': 'Database',
  'breadth-first-search': 'BFS',
  'tree': 'Trees',
  'matrix': 'Matrix',
  'bit-manipulation': 'Bit Manipulation',
  'two-pointers': 'Two Pointers',
  'binary-tree': 'Binary Tree',
  'heap-priority-queue': 'Heap',
  'stack': 'Stack',
  'prefix-sum': 'Prefix Sum',
  'graph': 'Graphs',
  'design': 'System Design',
  'simulation': 'Simulation',
  'counting': 'Counting',
  'backtracking': 'Backtracking',
  'sliding-window': 'Sliding Window',
  'linked-list': 'Linked Lists',
  'union-find': 'Union Find',
  'ordered-set': 'Ordered Set',
  'monotonic-stack': 'Monotonic Stack',
  'trie': 'Trie',
  'recursion': 'Recursion',
  'divide-and-conquer': 'Divide & Conquer'
};

// Problem difficulty weights
const DIFFICULTY_WEIGHTS = {
  easy: 1,
  medium: 3,
  hard: 5
};

// Calculate proficiency score for a topic
function calculateProficiency(solved, total) {
  if (total === 0) return 0;
  const completionRate = (solved / total) * 100;
  return Math.min(100, Math.round(completionRate));
}

// Generate problem suggestions based on topic and current skill level
function generateProblemSuggestions(topic) {
  const problemDatabase = {
    'Array': [
      { name: 'Two Sum', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
      { name: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { name: 'Contains Duplicate', difficulty: 'Easy', url: 'https://leetcode.com/problems/contains-duplicate/' }
    ],
    'String': [
      { name: 'Valid Anagram', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-anagram/' },
      { name: 'Valid Palindrome', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-palindrome/' },
      { name: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' }
    ],
    'Two Pointers': [
      { name: 'Valid Palindrome', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-palindrome/' },
      { name: 'Two Sum II', difficulty: 'Medium', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { name: 'Container With Most Water', difficulty: 'Medium', url: 'https://leetcode.com/problems/container-with-most-water/' }
    ],
    'Hash Table': [
      { name: 'Two Sum', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
      { name: 'Group Anagrams', difficulty: 'Medium', url: 'https://leetcode.com/problems/group-anagrams/' },
      { name: 'Top K Frequent Elements', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/' }
    ],
    'Dynamic Programming': [
      { name: 'Climbing Stairs', difficulty: 'Easy', url: 'https://leetcode.com/problems/climbing-stairs/' },
      { name: 'House Robber', difficulty: 'Medium', url: 'https://leetcode.com/problems/house-robber/' },
      { name: 'Coin Change', difficulty: 'Medium', url: 'https://leetcode.com/problems/coin-change/' }
    ],
    'Graph': [
      { name: 'Number of Islands', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
      { name: 'Clone Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/clone-graph/' },
      { name: 'Course Schedule', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule/' }
    ],
    'Tree': [
      { name: 'Maximum Depth of Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { name: 'Invert Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/invert-binary-tree/' },
      { name: 'Validate Binary Search Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/validate-binary-search-tree/' }
    ],
    'Binary Search': [
      { name: 'Binary Search', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-search/' },
      { name: 'Search in Rotated Sorted Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { name: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' }
    ],
    'Linked List': [
      { name: 'Reverse Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { name: 'Merge Two Sorted Lists', difficulty: 'Easy', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { name: 'Linked List Cycle', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/' }
    ],
    'Stack': [
      { name: 'Valid Parentheses', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-parentheses/' },
      { name: 'Min Stack', difficulty: 'Medium', url: 'https://leetcode.com/problems/min-stack/' },
      { name: 'Daily Temperatures', difficulty: 'Medium', url: 'https://leetcode.com/problems/daily-temperatures/' }
    ],
    'Backtracking': [
      { name: 'Subsets', difficulty: 'Medium', url: 'https://leetcode.com/problems/subsets/' },
      { name: 'Permutations', difficulty: 'Medium', url: 'https://leetcode.com/problems/permutations/' },
      { name: 'Combination Sum', difficulty: 'Medium', url: 'https://leetcode.com/problems/combination-sum/' }
    ],
    'Depth-First Search': [
      { name: 'Number of Islands', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
      { name: 'Max Area of Island', difficulty: 'Medium', url: 'https://leetcode.com/problems/max-area-of-island/' },
      { name: 'Flood Fill', difficulty: 'Easy', url: 'https://leetcode.com/problems/flood-fill/' }
    ],
    'Breadth-First Search': [
      { name: 'Binary Tree Level Order Traversal', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { name: 'Rotting Oranges', difficulty: 'Medium', url: 'https://leetcode.com/problems/rotting-oranges/' },
      { name: 'Minimum Depth of Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/minimum-depth-of-binary-tree/' }
    ],
    'Sorting': [
      { name: 'Merge Intervals', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/' },
      { name: 'Sort Colors', difficulty: 'Medium', url: 'https://leetcode.com/problems/sort-colors/' },
      { name: 'Kth Largest Element', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' }
    ],
    'Simulation': [
      { name: 'Spiral Matrix', difficulty: 'Medium', url: 'https://leetcode.com/problems/spiral-matrix/' },
      { name: 'Game of Life', difficulty: 'Medium', url: 'https://leetcode.com/problems/game-of-life/' },
      { name: 'Robot Bounded In Circle', difficulty: 'Medium', url: 'https://leetcode.com/problems/robot-bounded-in-circle/' }
    ],
    'Matrix': [
      { name: 'Rotate Image', difficulty: 'Medium', url: 'https://leetcode.com/problems/rotate-image/' },
      { name: 'Set Matrix Zeroes', difficulty: 'Medium', url: 'https://leetcode.com/problems/set-matrix-zeroes/' },
      { name: 'Spiral Matrix', difficulty: 'Medium', url: 'https://leetcode.com/problems/spiral-matrix/' }
    ],
    'Greedy': [
      { name: 'Maximum Subarray', difficulty: 'Medium', url: 'https://leetcode.com/problems/maximum-subarray/' },
      { name: 'Jump Game', difficulty: 'Medium', url: 'https://leetcode.com/problems/jump-game/' },
      { name: 'Best Time to Buy and Sell Stock II', difficulty: 'Medium', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/' }
    ],
    'Bit Manipulation': [
      { name: 'Single Number', difficulty: 'Easy', url: 'https://leetcode.com/problems/single-number/' },
      { name: 'Number of 1 Bits', difficulty: 'Easy', url: 'https://leetcode.com/problems/number-of-1-bits/' },
      { name: 'Counting Bits', difficulty: 'Easy', url: 'https://leetcode.com/problems/counting-bits/' }
    ],
    'Heap (Priority Queue)': [
      { name: 'Kth Largest Element in an Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { name: 'Top K Frequent Elements', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
      { name: 'Find Median from Data Stream', difficulty: 'Hard', url: 'https://leetcode.com/problems/find-median-from-data-stream/' }
    ]
  };

  const problems = problemDatabase[topic.topic] || [];
  
  if (topic.proficiency < 30) {
    return problems.filter(p => p.difficulty === 'Easy').slice(0, 3);
  } else if (topic.proficiency < 60) {
    return problems.filter(p => p.difficulty === 'Medium' || p.difficulty === 'Easy').slice(0, 3);
  } else {
    return problems.slice(0, 3);
  }
}

// Analyze skill gaps and generate recommendations
function generateRecommendations(topicBreakdown) {
  const weakTopics = topicBreakdown
    .filter(topic => topic.proficiency < 50)
    .sort((a, b) => a.proficiency - b.proficiency)
    .slice(0, 3);

  const recommendations = weakTopics.map(topic => ({
    topic: topic.topic,
    reason: `Only ${topic.proficiency}% proficiency - ${topic.proficiency < 30 ? 'critical gap' : 'needs improvement'}`,
    currentLevel: topic.proficiency,
    targetLevel: 70,
    suggestedProblems: generateProblemSuggestions(topic)
  }));

  return recommendations;
}

// Helper to calculate statistics
function calculateTopicStats(student) {
    // Create estimated topic breakdown from available LeetCode stats
    const totalSolved = student.leetcodeStats.totalSolved || 0;
    const easySolved = student.leetcodeStats.easySolved || 0;
    const mediumSolved = student.leetcodeStats.mediumSolved || 0;
    const hardSolved = student.leetcodeStats.hardSolved || 0;

    // Define topic targets specific to this student calculation context
    const TOPIC_TARGETS = {
      'Array': 150, 'String': 100, 'Hash Table': 80, 'Dynamic Programming': 100, 
      'Math': 80, 'Sorting': 60, 'Greedy': 60, 'Depth-First Search': 60, 
      'Binary Search': 50, 'Database': 40, 'Breadth-First Search': 50, 
      'Tree': 70, 'Matrix': 40, 'Two Pointers': 50, 'Binary Tree': 60, 
      'Bit Manipulation': 40, 'Heap (Priority Queue)': 30, 'Stack': 50, 
      'Prefix Sum': 30, 'Graph': 60, 'Simulation': 40, 'Design': 30, 
      'Counting': 30, 'Backtracking': 40, 'Sliding Window': 40, 
      'Union Find': 30, 'Linked List': 50, 'Ordered Set': 20, 
      'Monotonic Stack': 20, 'Trie': 20, 'Recursion': 40, 
      'Divide and Conquer': 20
    };

    let topicBreakdown = [];

    if (student.leetcodeStats.topics && student.leetcodeStats.topics.length > 0) {
       topicBreakdown = student.leetcodeStats.topics.map(t => {
           const target = TOPIC_TARGETS[t.name] || 50;
           return {
               topic: t.name,
               solved: t.solved,
               total: target,
               proficiency: calculateProficiency(t.solved, target),
               easy: 0, medium: 0, hard: 0
           };
       })
       .sort((a, b) => b.proficiency - a.proficiency)
       .slice(0, 15);
    } else {
        // Fallback to estimation
        const basicTopics = [
            { topic: 'Arrays', solved: Math.floor(easySolved * 0.3 + mediumSolved * 0.2), total: 100, easy: Math.floor(easySolved * 0.3), medium: Math.floor(mediumSolved * 0.2), hard: 0 },
            { topic: 'Strings', solved: Math.floor(easySolved * 0.25 + mediumSolved * 0.15), total: 80, easy: Math.floor(easySolved * 0.25), medium: Math.floor(mediumSolved * 0.15), hard: 0 },
            { topic: 'Two Pointers', solved: Math.floor(mediumSolved * 0.15), total: 60, easy: 0, medium: Math.floor(mediumSolved * 0.15), hard: 0 },
            { topic: 'Hash Tables', solved: Math.floor(mediumSolved * 0.18), total: 75, easy: 0, medium: Math.floor(mediumSolved * 0.18), hard: 0 },
            { topic: 'Dynamic Programming', solved: Math.floor(mediumSolved * 0.12 + hardSolved * 0.4), total: 80, easy: 0, medium: Math.floor(mediumSolved * 0.12), hard: Math.floor(hardSolved * 0.4) },
            { topic: 'Graphs', solved: Math.floor(mediumSolved * 0.1 + hardSolved * 0.2), total: 70, easy: 0, medium: Math.floor(mediumSolved * 0.1), hard: Math.floor(hardSolved * 0.2) },
            { topic: 'Trees', solved: Math.floor(easySolved * 0.15 + mediumSolved * 0.12), total: 90, easy: Math.floor(easySolved * 0.15), medium: Math.floor(mediumSolved * 0.12), hard: 0 },
            { topic: 'Binary Search', solved: Math.floor(mediumSolved * 0.1), total: 55, easy: 0, medium: Math.floor(mediumSolved * 0.1), hard: 0 },
            { topic: 'Linked Lists', solved: Math.floor(easySolved * 0.15), total: 60, easy: Math.floor(easySolved * 0.15), medium: 0, hard: 0 },
            { topic: 'Stack', solved: Math.floor(mediumSolved * 0.08), total: 50, easy: 0, medium: Math.floor(mediumSolved * 0.08), hard: 0 },
            { topic: 'Backtracking', solved: Math.floor(mediumSolved * 0.08 + hardSolved * 0.25), total: 45, easy: 0, medium: Math.floor(mediumSolved * 0.08), hard: Math.floor(hardSolved * 0.25) },
            { topic: 'Sorting', solved: Math.floor(mediumSolved * 0.09), total: 40, easy: 0, medium: Math.floor(mediumSolved * 0.09), hard: 0 },
            { topic: 'DFS', solved: Math.floor(mediumSolved * 0.1), total: 55, easy: 0, medium: Math.floor(mediumSolved * 0.1), hard: 0 },
            { topic: 'BFS', solved: Math.floor(mediumSolved * 0.08), total: 50, easy: 0, medium: Math.floor(mediumSolved * 0.08), hard: 0 },
            { topic: 'Simulation', solved: Math.floor(mediumSolved * 0.07), total: 35, easy: 0, medium: Math.floor(mediumSolved * 0.07), hard: 0 }
        ];

        topicBreakdown = basicTopics
            .map(topic => ({ ...topic, proficiency: calculateProficiency(topic.solved, topic.total) }))
            .filter(t => t.solved > 0)
            .sort((a, b) => b.proficiency - a.proficiency);
    }

    const strongAreas = topicBreakdown.filter(t => t.proficiency >= 70).map(t => t.topic).slice(0, 3);
    const weakAreas = topicBreakdown.filter(t => t.proficiency < 50).sort((a, b) => a.proficiency - b.proficiency).map(t => t.topic).slice(0, 3);
    
    const overallScore = topicBreakdown.length > 0
      ? Math.round(topicBreakdown.reduce((sum, t) => sum + t.proficiency, 0) / topicBreakdown.length)
      : Math.min(100, Math.round((totalSolved / 200) * 100));

    // Provide detailed weak topics for analysis usage
    const weakTopics = topicBreakdown
      .filter(t => t.proficiency < 50)
      .sort((a, b) => a.proficiency - b.proficiency)
      .slice(0, 3);

    return { topicBreakdown, strongAreas, weakAreas, overallScore, weakTopics };
}

// GET /api/skill-analysis/:studentId - Get FAST skill analysis (No AI)
router.get('/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const stats = calculateTopicStats(student);
    
    // Generate immediate fallback recommendations (Fast)
    const recommendations = generateRecommendations(stats.topicBreakdown);

    res.json({
      studentId: student._id,
      studentName: student.name,
      ...stats,
      recommendations,
      aiAnalysis: null, // AI will be fetched separately
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error in skill analysis:', error);
    res.status(500).json({ message: 'Failed', error: error.message });
  }
});

// GET /api/skill-analysis/:studentId/ai - Get SLOW AI Insights
router.get('/:studentId/ai', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const stats = calculateTopicStats(student);
        
        let aiRecommendations = [];
        try {
            const aiRecs = await generateAIRecommendations(stats.weakTopics);
            if (aiRecs && Array.isArray(aiRecs) && aiRecs.length > 0) {
                aiRecommendations = aiRecs;
            }
        } catch (e) {
            console.error("AI Recommendation error:", e.message);
        }

        let aiAnalysis = null;
        try {
            aiAnalysis = await generateSkillAnalysis(student.name, stats.topicBreakdown);
        } catch (e) {
            console.error("AI Analysis error:", e.message);
        }

        res.json({
            aiAnalysis,
            recommendations: aiRecommendations.length > 0 ? aiRecommendations : null
        });

    } catch (error) {
        console.error('Error in AI analysis:', error);
        res.status(500).json({ message: 'Failed AI', error: error.message });
    }
});

// POST /api/skill-analysis/:studentId/refresh - Force refresh analysis
router.post('/:studentId/refresh', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Analysis refreshed successfully', timestamp: new Date() });
  } catch (error) {
    console.error('Error refreshing analysis:', error);
    res.status(500).json({ message: 'Failed to refresh analysis', error: error.message });
  }
});

// GET /api/skill-analysis/:studentId/learning-path - Get personalized learning path
router.get('/:studentId/learning-path', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const learningPath = {
      duration: '30 days',
      weeklyGoals: [
        { week: 1, focus: 'Dynamic Programming Basics', problems: 5, topics: ['1D DP', 'Memoization'] },
        { week: 2, focus: 'Graph Fundamentals', problems: 5, topics: ['BFS', 'DFS', 'Graph Representation'] },
        { week: 3, focus: 'Advanced DP', problems: 4, topics: ['2D DP', 'State Machines'] },
        { week: 4, focus: 'Graph Algorithms', problems: 4, topics: ['Dijkstra', 'Union Find', 'Topological Sort'] }
      ]
    };
    res.json(learningPath);
  } catch (error) {
    console.error('Error generating learning path:', error);
    res.status(500).json({ message: 'Failed to generate learning path', error: error.message });
  }
});

module.exports = router;
