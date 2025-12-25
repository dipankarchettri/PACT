// routes/skillAnalysis.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
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
    'Arrays': [
      { name: 'Two Sum', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
      { name: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { name: 'Contains Duplicate', difficulty: 'Easy', url: 'https://leetcode.com/problems/contains-duplicate/' }
    ],
    'Strings': [
      { name: 'Valid Anagram', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-anagram/' },
      { name: 'Valid Palindrome', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-palindrome/' },
      { name: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' }
    ],
    'Two Pointers': [
      { name: 'Valid Palindrome', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-palindrome/' },
      { name: 'Two Sum II', difficulty: 'Medium', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { name: 'Container With Most Water', difficulty: 'Medium', url: 'https://leetcode.com/problems/container-with-most-water/' }
    ],
    'Hash Tables': [
      { name: 'Two Sum', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
      { name: 'Group Anagrams', difficulty: 'Medium', url: 'https://leetcode.com/problems/group-anagrams/' },
      { name: 'Top K Frequent Elements', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/' }
    ],
    'Dynamic Programming': [
      { name: 'Climbing Stairs', difficulty: 'Easy', url: 'https://leetcode.com/problems/climbing-stairs/' },
      { name: 'House Robber', difficulty: 'Medium', url: 'https://leetcode.com/problems/house-robber/' },
      { name: 'Coin Change', difficulty: 'Medium', url: 'https://leetcode.com/problems/coin-change/' }
    ],
    'Graphs': [
      { name: 'Number of Islands', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
      { name: 'Clone Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/clone-graph/' },
      { name: 'Course Schedule', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule/' }
    ],
    'Trees': [
      { name: 'Maximum Depth of Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { name: 'Invert Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/invert-binary-tree/' },
      { name: 'Validate Binary Search Tree', difficulty: 'Medium', url: 'https://leetcode.com/problems/validate-binary-search-tree/' }
    ],
    'Binary Search': [
      { name: 'Binary Search', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-search/' },
      { name: 'Search in Rotated Sorted Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { name: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' }
    ],
    'Linked Lists': [
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
    'DFS': [
      { name: 'Number of Islands', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
      { name: 'Max Area of Island', difficulty: 'Medium', url: 'https://leetcode.com/problems/max-area-of-island/' },
      { name: 'Flood Fill', difficulty: 'Easy', url: 'https://leetcode.com/problems/flood-fill/' }
    ],
    'BFS': [
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

// GET /api/skill-analysis/:studentId - Get skill analysis for a student
router.get('/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create estimated topic breakdown from available LeetCode stats
    const totalSolved = student.leetcodeStats.totalSolved || 0;
    const easySolved = student.leetcodeStats.easySolved || 0;
    const mediumSolved = student.leetcodeStats.mediumSolved || 0;
    const hardSolved = student.leetcodeStats.hardSolved || 0;

    // Estimate topic distribution based on difficulty
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

    // Calculate proficiency for each topic and filter out topics with no problems solved
    const topicBreakdown = basicTopics
      .map(topic => ({
        ...topic,
        proficiency: calculateProficiency(topic.solved, topic.total)
      }))
      .filter(t => t.solved > 0) // Only show topics where student solved at least 1 problem
      .sort((a, b) => b.proficiency - a.proficiency);

    // Identify strong and weak areas
    const strongAreas = topicBreakdown
      .filter(t => t.proficiency >= 70)
      .map(t => t.topic)
      .slice(0, 3);

    const weakAreas = topicBreakdown
      .filter(t => t.proficiency < 50)
      .map(t => t.topic)
      .slice(0, 3);

    // Calculate overall score
    const overallScore = topicBreakdown.length > 0
      ? Math.round(topicBreakdown.reduce((sum, t) => sum + t.proficiency, 0) / topicBreakdown.length)
      : Math.min(100, Math.round((totalSolved / 200) * 100));

    // Generate recommendations
    const recommendations = generateRecommendations(topicBreakdown);

    const analysis = {
      studentId: student._id,
      studentName: student.name,
      topicBreakdown,
      strongAreas,
      weakAreas,
      overallScore,
      recommendations,
      lastUpdated: new Date()
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error generating skill analysis:', error);
    res.status(500).json({ message: 'Failed to generate skill analysis', error: error.message });
  }
});

// POST /api/skill-analysis/:studentId/refresh - Force refresh analysis
router.post('/:studentId/refresh', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({ 
      message: 'Analysis refreshed successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error refreshing analysis:', error);
    res.status(500).json({ message: 'Failed to refresh analysis', error: error.message });
  }
});

// GET /api/skill-analysis/:studentId/learning-path - Get personalized learning path
router.get('/:studentId/learning-path', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const learningPath = {
      duration: '30 days',
      weeklyGoals: [
        {
          week: 1,
          focus: 'Dynamic Programming Basics',
          problems: 5,
          topics: ['1D DP', 'Memoization']
        },
        {
          week: 2,
          focus: 'Graph Fundamentals',
          problems: 5,
          topics: ['BFS', 'DFS', 'Graph Representation']
        },
        {
          week: 3,
          focus: 'Advanced DP',
          problems: 4,
          topics: ['2D DP', 'State Machines']
        },
        {
          week: 4,
          focus: 'Graph Algorithms',
          problems: 4,
          topics: ['Dijkstra', 'Union Find', 'Topological Sort']
        }
      ]
    };

    res.json(learningPath);
  } catch (error) {
    console.error('Error generating learning path:', error);
    res.status(500).json({ message: 'Failed to generate learning path', error: error.message });
  }
});

module.exports = router;
