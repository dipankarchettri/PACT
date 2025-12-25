import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { skillAnalysisService } from '../services/skillAnalysisService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Target, Award, BookOpen, Lightbulb, RefreshCw } from 'lucide-react';

const SmartSkillAnalyzer = () => {
  const { id: studentId } = useParams();
  const [analysisData, setAnalysisData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchAnalysis();
    }
  }, [studentId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await skillAnalysisService.getAnalysis(studentId);
      
      setAnalysisData({
        topicBreakdown: data.topicBreakdown || [],
        weakAreas: data.weakAreas || [],
        strongAreas: data.strongAreas || [],
        overallScore: data.overallScore || 0
      });
      
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Failed to load skill analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await skillAnalysisService.refreshAnalysis(studentId);
      await fetchAnalysis();
    } catch (err) {
      console.error('Error refreshing analysis:', err);
      setError('Failed to refresh analysis.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProficiencyLevel = (score) => {
    if (score >= 80) return { label: 'Expert', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Proficient', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { label: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Beginner', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchAnalysis}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData || analysisData.topicBreakdown.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 mb-2">No analysis data available yet.</p>
          <p className="text-yellow-600 text-sm">Student needs to solve more problems on LeetCode.</p>
        </div>
      </div>
    );
  }

  const radarData = analysisData.topicBreakdown.slice(0, 8).map(item => ({
    topic: item.topic.substring(0, 10),
    proficiency: item.proficiency
  }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Smart Skill Analysis</h1>
            </div>
            <p className="text-blue-100">AI-powered insights to identify knowledge gaps and accelerate learning</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Overall Proficiency Score</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-blue-600">{analysisData.overallScore}</span>
              <span className="text-2xl text-gray-400">/100</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getProficiencyLevel(analysisData.overallScore).bg}`}>
              <Award className={`w-5 h-5 ${getProficiencyLevel(analysisData.overallScore).color}`} />
              <span className={`font-semibold ${getProficiencyLevel(analysisData.overallScore).color}`}>
                {getProficiencyLevel(analysisData.overallScore).label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Breakdown - Bar Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Topic-wise Problem Solving
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analysisData.topicBreakdown}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="topic" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="easy" stackId="a" fill="#10b981" name="Easy" />
            <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium" />
            <Bar dataKey="hard" stackId="a" fill="#ef4444" name="Hard" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Proficiency Radar Chart & Strong/Weak Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Proficiency Radar</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="topic" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Proficiency" dataKey="proficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Strong & Weak Areas */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Strong Areas
            </h3>
            <div className="space-y-2">
              {analysisData.strongAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{area}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Areas for Improvement
            </h3>
            <div className="space-y-2">
              {analysisData.weakAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Personalized Problem Recommendations
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Click on any problem to practice on LeetCode 🚀
          </p>
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{rec.topic}</h3>
                    <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Recommended Problems:</p>
                  {rec.suggestedProblems && rec.suggestedProblems.map((problem, pIdx) => (
                    <a
                      key={pIdx}
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white hover:bg-blue-50 rounded-lg transition-all border border-gray-200 hover:border-blue-300 hover:shadow-md group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
                        <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                          {problem.name}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Details Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Topic Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Topic</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Solved</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Easy</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Medium</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Hard</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Proficiency</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analysisData.topicBreakdown.map((topic, idx) => {
                const level = getProficiencyLevel(topic.proficiency);
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{topic.topic}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                      {topic.solved}/{topic.total}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-green-600">{topic.easy || 0}</td>
                    <td className="px-4 py-3 text-sm text-center text-yellow-600">{topic.medium || 0}</td>
                    <td className="px-4 py-3 text-sm text-center text-red-600">{topic.hard || 0}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${topic.proficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-700 font-medium">{topic.proficiency}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${level.bg} ${level.color}`}>
                        {level.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SmartSkillAnalyzer;
