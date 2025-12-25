import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'; // Added useLocation
import { skillAnalysisService } from '../services/skillAnalysisService';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Target, Award, BookOpen, Lightbulb, RefreshCw, Sparkles, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import { motion } from 'framer-motion'; // Added motion
import Navbar from './Navbar';
import LoadingScreen from './LoadingScreen'; // Added LoadingScreen
import Logo from './Logo'; // Added Logo for custom navbar if needed
import { Button } from './ui/Button'; // Added Button
import { Card, CardContent } from './ui/Card'; // Added Card components

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#8dd1e1', '#a4de6c', '#d0ed57', '#a4c8e0', '#ff8042', '#867ae9'];

const SmartSkillAnalyzer = () => {
  const { id: studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Added location hook for state access
  const [analysisData, setAnalysisData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
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
        topicBreakdown: (data.topicBreakdown || []).map(t => 
          t.topic === 'Tree' ? { ...t, topic: 'Trees' } : t
        ),
        weakAreas: data.weakAreas || [],
        strongAreas: data.strongAreas || [],
        overallScore: data.overallScore || 0,
        aiAnalysis: null // Initially null
      });
      
      setRecommendations(data.recommendations || []);
      
      // Fetch AI Insights afterwards
      fetchAIInsights();

    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Failed to load skill analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async () => {
      try {
          setAiLoading(true);
          const aiData = await skillAnalysisService.getAIInsights(studentId);
          
          if (aiData.aiAnalysis) {
              setAnalysisData(prev => ({ ...prev, aiAnalysis: aiData.aiAnalysis }));
          }
          if (aiData.recommendations) {
              setRecommendations(aiData.recommendations);
          }
      } catch (e) {
          console.error("Failed to load AI insights:", e);
      } finally {
          setAiLoading(false);
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
    return <LoadingScreen />;
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
        {/* Dynamic Background from StudentDetail */}
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-200 rounded-full blur-[100px]"></div>
        </div>

        {/* Custom Navbar matching StudentDetail */}
        <nav className="sticky top-0 z-50 glass border-b border-white/20 px-4 md:px-8 py-4 mb-8">
            <div className="w-full px-2 md:px-6 flex justify-between items-center">
                <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
                    onClick={() => navigate('/')}
                >
                    <Logo className="w-10 h-10" />
                    <div>
                        <span className="text-2xl font-black tracking-tight text-slate-900">
                            PACT
                        </span>
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Performance Analytics & Code Tracker</span>
                            <span className="text-[10px] text-slate-900 font-bold tracking-wider uppercase">Dept of AI&DS, SIET</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Back</span>
                </Button>
            </div>
        </nav>

        <motion.div
            className="w-full px-4 md:px-8 pb-12 relative z-10 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
      {/* Header & Overall Score Stacked */}
      <div className="space-y-4">
          {/* Header Section (Blue/Purple Gradient) */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Smart Skill Analysis</h1>
              </div>
              <p className="text-blue-100 opacity-90 max-w-md">AI-powered insights to identify knowledge gaps and accelerate learning.</p>
            </div>
            
            <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium backdrop-blur-sm"
            >
                <RefreshCw className="w-4 h-4" />
                Refresh
            </button>
          </div>

          {/* Overall Score Section (White) */}
          <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
             <div className="absolute -top-4 -right-4 p-4 opacity-5">
                 <Award className="w-48 h-48 text-blue-600" />
             </div>
             <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {location.state?.student?.name ? `${location.state.student.name.split(' ')[0]}'s` : 'Overall'} Proficiency Score
                    </h2>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-blue-600 tracking-tight">{analysisData.overallScore}</span>
                        <span className="text-2xl text-gray-400 font-medium">/100</span>
                    </div>
                </div>
             
                <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border ${getProficiencyLevel(analysisData.overallScore).bg.replace('bg-', 'border-').replace('100', '200')} ${getProficiencyLevel(analysisData.overallScore).bg}`}>
                    <Award className={`w-8 h-8 ${getProficiencyLevel(analysisData.overallScore).color}`} />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Proficiency Level</span>
                        <span className={`text-xl font-bold ${getProficiencyLevel(analysisData.overallScore).color}`}>
                            {getProficiencyLevel(analysisData.overallScore).label}
                        </span>
                    </div>
                </div>
             </div>
          </div>
      </div>

      {/* Graphs Grid: Bar Chart (2) + Radar Chart (1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topic Breakdown - Bar Chart (Col Span 2) */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Topic-wise Problem Solving
            </h2>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={analysisData.topicBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="solved" name="Total Solved" radius={[4, 4, 0, 0]}>
                  {analysisData.topicBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Proficiency Radar Chart (Col Span 1) */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1 h-full"> 
            <h2 className="text-xl font-semibold mb-4">Proficiency Radar</h2>
            <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="topic" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Proficiency" dataKey="proficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </RadarChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Personalized Recommendations & Strong/Weak Areas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Personalized Problem Recommendations
          {aiLoading && <span className="text-sm font-normal text-gray-500 flex items-center gap-1 ml-2"><RefreshCw className="w-3 h-3 animate-spin"/> Refining with AI...</span>}
        </h2>
        
        {/* Strong & Weak Areas (Moved Inside) */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" /> Strong Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                    {analysisData.strongAreas.map((area, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white border border-green-100 px-3 py-2 rounded-lg shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700 font-medium">{area}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" /> Areas for Improvement
                </h3>
                <div className="flex flex-wrap gap-2">
                    {analysisData.weakAreas.map((area, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white border border-red-100 px-3 py-2 rounded-lg shadow-sm">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-gray-700 font-medium">{area}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {recommendations.length > 0 ? (
          <>
          <p className="text-sm text-gray-600 mb-4 font-medium">
            Based on your weak areas, here are some problems to help you improve 🚀
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-blue-50/50 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{rec.topic}</h3>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 flex-grow">{rec.reason}</p>
                
                <div className="space-y-2 mt-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Problems</p>
                  {rec.suggestedProblems && rec.suggestedProblems.map((problem, pIdx) => (
                    <a
                      key={pIdx}
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 bg-white hover:bg-blue-50 rounded-lg transition-all border border-gray-200 hover:border-blue-300 group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0">➜</span>
                        <span className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors text-xs truncate">
                          {problem.name}
                        </span>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          </>
        ) : (
           <p className="text-gray-500 italic text-center py-8">No specific recommendations yet.</p>
        )}
      </div>
      
      {/* AI Analysis Section (Moved Down for flow) */}
       <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Skill Assessment
        </h2>
        {aiLoading && !analysisData.aiAnalysis ? (
          <div className="flex items-center gap-2 text-purple-600 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Generating personalized insights...</span>
          </div>
        ) : (
          <p className="text-gray-700 leading-relaxed font-medium">
            {analysisData.aiAnalysis || "AI analysis unavailable."}
          </p>
        )}
      </div>

      {/* Detailed Topic Breakdown (Grid) */}
      <h2 className="text-xl font-bold text-gray-800 px-1">Detailed Topic Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysisData.topicBreakdown.map((topic, idx) => {
          const level = getProficiencyLevel(topic.proficiency);
          return (
            <div key={idx} className="bg-white rounded-lg shadow-sm p-5 border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
               {/* Progress background bar */}
               <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
                   <div 
                        className={`h-full ${level.bg.replace('bg-', 'bg-').replace('100', '500')}`} 
                        style={{ width: `${topic.proficiency}%` }}
                   ></div>
               </div>

              <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800 text-lg">{topic.topic}</h3>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${level.bg} ${level.color}`}>
                    {level.label}
                  </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 my-4">
                  <div>
                      <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Proficiency</div>
                      <div className={`text-2xl font-black ${level.color}`}>{topic.proficiency}%</div>
                  </div>
                  <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Solved</div>
                      <div className="text-2xl font-bold text-gray-700">
                        {topic.solved} <span className="text-sm text-gray-400 font-medium">/ {topic.total}</span>
                      </div>
                  </div>
              </div>
              
               <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div
                    className={`h-1.5 rounded-full transition-all duration-1000 ${level.bg.replace('bg-', 'bg-').replace('100', '500')}`}
                    style={{ width: `${topic.proficiency}%` }}
                    ></div>
                </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  </div>
);
};

export default SmartSkillAnalyzer;
