import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../lib/apiClient';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Chart } from "react-google-charts";
import { Github, Code2, Linkedin, ArrowLeft, RefreshCw, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

import ActivityGraph from '../components/ActivityGraph';
import TimelineGraph from '../components/TimelineGraph';
import Logo from '../components/Logo';

export default function StudentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        setLoading(true);
        try {
            const response = await studentAPI.getById(id);
            setStudent(response.data);
        } catch (error) {
            console.error('Error fetching student:', error);
            alert('Failed to fetch student details');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await studentAPI.refresh(id);
            setStudent(response.data);
            alert('Student data refreshed successfully!');
        } catch (error) {
            console.error('Error refreshing student:', error);
            alert('Failed to refresh student data');
        } finally {
            setRefreshing(false);
        }
    };



    // Animation Variants
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-600 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
                    <p className="mt-4 font-medium">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-500 mb-4">Student not found</p>
                    <Button onClick={() => navigate('/')}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // Google Chart Data
    const languageData = [
        ["Language", "Problems Solved"],
        ...Object.entries(student.leetcodeStats.languages || {}).map(([name, value]) => [name, value])
    ];

    const COLORS = ['#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b', '#10b981', '#94a3b8'];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-200 rounded-full blur-[100px]"></div>
            </div>

            {/* Navbar */}
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
                    <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800">
                        <ArrowLeft className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                </div>
            </nav>

            <motion.div
                className="w-full px-4 md:px-8 pb-12 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >


                {/* Hero Profile Card */}
                <motion.div variants={itemVariants} className="mb-6">
                    <Card className="glass-card overflow-hidden !border-slate-300 shadow-sm bg-gradient-to-r from-white/80 to-white/40">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                                <div className="flex-1 text-center md:text-left">
                                    {/* Name and Badges Row */}
                                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                                            {student.name}
                                        </h1>
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200 text-slate-600 font-medium">{student.usn}</span>
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200 text-slate-600 font-medium">{student.section}</span>
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200 text-slate-600 font-medium">{student.batch}</span>
                                        </div>
                                    </div>

                                    {/* Contact and Socials Row */}
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-slate-500 text-xs">
                                        {student.email && (
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span>{student.email}</span>
                                            </div>
                                        )}
                                        {student.phoneNumber && (
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{student.phoneNumber}</span>
                                            </div>
                                        )}
                                        
                                        {/* Divider (only visible on md up if both contact and socials exist) */}
                                        <div className="hidden md:block w-px h-3 bg-slate-300 mx-1"></div>

                                        <div className="flex gap-2">
                                            {student.githubUsername && (
                                                <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                                                    <Github className="w-4 h-4" />
                                                </a>
                                            )}
                                            {student.leetcodeUsername && (
                                                <a href={`https://leetcode.com/${student.leetcodeUsername}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-orange-500 transition-colors">
                                                    <Code2 className="w-4 h-4" />
                                                </a>
                                            )}
                                            {student.linkedinUrl && (
                                                <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                                                    <Linkedin className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Compact Score Card */}
                                <div className="bg-white/50 p-2 px-4 rounded-xl border border-slate-300 shadow-sm text-center min-w-[100px]">
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Score</div>
                                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-600 to-fuchsia-600 leading-none">
                                        {student.performanceScore}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-stretch">
                    {/* LeetCode Section */}
                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="glass-card !border-slate-300 shadow-sm h-full flex flex-col relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                                <Code2 className="w-48 h-48 text-orange-500" />
                            </div>
                            <CardHeader className="pb-2 border-b border-orange-50">
                                <CardTitle className="flex items-center gap-3 text-lg text-slate-800">
                                    <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600"><Code2 className="w-4 h-4" /></div>
                                    LeetCode Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 px-3 pb-3 space-y-3 relative z-10">
                                {/* Hero Stat */}
                                <div className="text-center">
                                    <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{student.leetcodeStats.totalSolved}</div>
                                    <div className="text-xs font-semibold text-orange-500 uppercase tracking-wide mt-1">Total Problems Solved</div>
                                </div>

                                {/* Difficulty Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div className="p-2 bg-emerald-50/50 rounded-lg text-center border border-slate-300 shadow-sm hover:scale-105 transition-transform">
                                        <div className="text-lg font-bold text-emerald-600">{student.leetcodeStats.easySolved}</div>
                                        <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">Easy</div>
                                    </div>
                                    <div className="p-2 bg-amber-50/50 rounded-lg text-center border border-slate-300 shadow-sm hover:scale-105 transition-transform">
                                        <div className="text-lg font-bold text-amber-600">{student.leetcodeStats.mediumSolved}</div>
                                        <div className="text-[8px] font-bold text-amber-400 uppercase tracking-wider mt-0.5">Medium</div>
                                    </div>
                                    <div className="p-2 bg-rose-50/50 rounded-lg text-center border border-slate-300 shadow-sm hover:scale-105 transition-transform">
                                        <div className="text-lg font-bold text-rose-600">{student.leetcodeStats.hardSolved}</div>
                                        <div className="text-[8px] font-bold text-rose-400 uppercase tracking-wider mt-0.5">Hard</div>
                                    </div>
                                </div>

                                {/* Streaks & Rating */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-slate-50/50 p-2 rounded-lg text-center border border-slate-300 shadow-sm">
                                        <div className="text-[9px] text-slate-400 mb-0.5">Rating</div>
                                        <div className="font-bold text-slate-700 text-sm">{student.leetcodeStats.contestRating || 'N/A'}</div>
                                    </div>
                                    <div className="bg-orange-50/50 p-2 rounded-lg text-center border border-slate-300 shadow-sm">
                                        <div className="text-[9px] text-orange-400 mb-0.5 uppercase font-bold">Current</div>
                                        <div className="font-bold text-orange-700 text-sm">🔥 {student.leetcodeStats.currentStreak}d</div>
                                    </div>
                                    <div className="bg-violet-50/50 p-2 rounded-lg text-center border border-slate-300 shadow-sm">
                                        <div className="text-[9px] text-violet-400 mb-0.5 uppercase font-bold">Longest</div>
                                        <div className="font-bold text-violet-700 text-sm">⭐ {student.leetcodeStats.longestStreak}d</div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-slate-100 min-w-0">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity</div>
                                    <div className="border border-slate-300 shadow-sm rounded-xl overflow-hidden p-2 bg-transparent">
                                        <ActivityGraph
                                            type="leetcode"
                                            username={student.leetcodeUsername}
                                            data={student.leetcodeStats.submissionCalendar}
                                            embedded={true}
                                        />
                                    </div>
                                    <div className="w-full min-w-0 h-28 md:h-auto md:aspect-[7/1] border border-slate-300 shadow-sm rounded-xl overflow-hidden p-2 bg-transparent">
                                        <TimelineGraph type="leetcode" data={student.leetcodeStats.submissionCalendar} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* GitHub Section */}
                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="glass-card !border-slate-300 shadow-sm h-full flex flex-col relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                                <Github className="w-48 h-48 text-emerald-500" />
                            </div>
                            <CardHeader className="pb-2 border-b border-emerald-50">
                                <CardTitle className="flex items-center gap-3 text-lg text-slate-800">
                                    <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600"><Github className="w-4 h-4" /></div>
                                    GitHub Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 px-3 pb-3 space-y-3 relative z-10">
                                <div className="text-center">
                                    <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{student.githubStats.totalCommits}</div>
                                    <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mt-1">Total Contributions</div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-300 shadow-sm">
                                        <div className="text-lg font-bold text-slate-700">{student.githubStats.publicRepos}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Repositories</div>
                                    </div>
                                    <div className="p-2 bg-yellow-50 rounded-lg text-center border border-slate-300 shadow-sm">
                                        <div className="text-lg font-bold text-yellow-600">{student.githubStats.stars || 0}</div>
                                        <div className="text-[8px] font-bold text-yellow-500 uppercase tracking-wider mt-0.5">Stars Earned</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-emerald-50/50 p-2 rounded-lg text-center border border-slate-300 shadow-sm">
                                        <div className="text-[9px] text-emerald-400 mb-0.5 uppercase font-bold">Current</div>
                                        <div className="font-bold text-emerald-700 text-sm">🔥 {student.githubStats.currentStreak}d</div>
                                    </div>
                                    <div className="bg-emerald-50/50 p-2 rounded-lg text-center border border-slate-300 shadow-sm">
                                        <div className="text-[9px] text-emerald-400 mb-0.5 uppercase font-bold">Longest</div>
                                        <div className="font-bold text-emerald-700 text-sm">⭐ {student.githubStats.longestStreak}d</div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-slate-100 min-w-0">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity</div>
                                    <div className="border border-slate-300 shadow-sm rounded-xl overflow-hidden p-2 bg-transparent">
                                        <ActivityGraph
                                            type="github"
                                            username={student.githubUsername}
                                            embedded={true}
                                        />
                                    </div>
                                    <div className="w-full min-w-0 h-28 md:h-auto md:aspect-[7/1] border border-slate-300 shadow-sm rounded-xl overflow-hidden p-2 bg-transparent">
                                        <TimelineGraph type="github" username={student.githubUsername} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Language 3D Chart */}
                {Object.keys(student.leetcodeStats.languages || {}).length > 0 && (
                    <motion.div variants={itemVariants}>
                        <Card className="glass-card !border-slate-300 shadow-sm h-[350px]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-slate-700 text-lg">Language Proficiency</CardTitle>
                                <CardDescription className="text-xs">Distribution of problems solved by programming language</CardDescription>
                            </CardHeader>
                            <CardContent className="h-full pb-16">
                                <Chart
                                    chartType="PieChart"
                                    data={languageData}
                                    options={{
                                        is3D: true,
                                        backgroundColor: 'transparent',
                                        colors: COLORS,
                                        legend: { position: 'right', textStyle: { color: '#64748b', fontSize: 13 } },
                                        chartArea: { width: '90%', height: '80%' },
                                        fontName: 'Outfit',
                                        pieSliceTextStyle: { color: 'white', fontSize: 12 }
                                    }}
                                    width={"100%"}
                                    height={"100%"}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <div className="mt-8 flex flex-col items-center gap-4">
                    <Button 
                        onClick={handleRefresh} 
                        disabled={refreshing} 
                        variant="outline" 
                        className="bg-white/50 backdrop-blur border-slate-200 hover:bg-white transition-all rounded-full shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing Data...' : 'Refresh Student Data'}
                    </Button>
                    <div className="text-slate-400 text-sm">
                        Last updated: {new Date(student.lastUpdated).toLocaleString()}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
