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
import Badge from '../components/Badge';
import LoadingScreen from '../components/LoadingScreen';
import { useToast } from '../contexts/ToastContext';

export default function StudentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
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
            addToast('Failed to fetch student details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await studentAPI.refresh(id);
            setStudent(response.data);
            addToast('Student data refreshed successfully!', 'success');
        } catch (error) {
            console.error('Error refreshing student:', error);
            addToast('Failed to refresh student data', 'error');
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
        return <LoadingScreen />;
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
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                {/* Col 1: Name & Info (5 cols) */}
                                <div className="lg:col-span-5 text-center lg:text-left">
                                    <div className="flex flex-col lg:flex-row items-center gap-3 mb-2">
                                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                                            {student.name}
                                        </h1>
                                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                            <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200 text-slate-600 font-bold tracking-wide">{student.usn}</span>
                                            <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200 text-slate-600 font-bold tracking-wide">{student.section}</span>
                                            <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200 text-slate-600 font-bold tracking-wide">{student.batch}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-slate-500 text-xs font-medium mb-1">
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
                                    </div>

                                    <div className="flex items-center justify-center lg:justify-start gap-4 mt-3">
                                        {student.githubUsername && (
                                            <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm transition-all hover:scale-110">
                                                <Github className="w-4 h-4" />
                                            </a>
                                        )}
                                        {student.leetcodeUsername && (
                                            <a href={`https://leetcode.com/${student.leetcodeUsername}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-slate-400 hover:text-orange-500 border border-slate-200 shadow-sm transition-all hover:scale-110">
                                                <Code2 className="w-4 h-4" />
                                            </a>
                                        )}
                                        {student.linkedinUrl && (
                                            <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-slate-400 hover:text-blue-600 border border-slate-200 shadow-sm transition-all hover:scale-110">
                                                <Linkedin className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Col 2: Badges (4 cols) - Centered */}
                                <div className="lg:col-span-4 flex flex-col items-center justify-center">
                                    {student.badges && student.badges.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {student.badges.map((badge, index) => (
                                                <Badge key={index} type={badge} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-slate-400 text-xs italic">No badges earned yet</div>
                                    )}
                                </div>

                                {/* Col 3: Score (3 cols) - Right aligned */}
                                <div className="lg:col-span-3 flex justify-center lg:justify-end">
                                    <div className="bg-white/60 backdrop-blur-sm p-3 px-6 rounded-2xl border border-slate-200 shadow-sm text-center min-w-[140px]">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Performance Score</div>
                                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-600 to-fuchsia-600 leading-none tracking-tighter">
                                            {student.performanceScore}
                                        </div>
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
