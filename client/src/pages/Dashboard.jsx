import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { studentAPI } from '../lib/apiClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Search, MoreVertical, Trophy, Users, Code2, Github, Download, Plus, Edit, Upload, RefreshCw, Zap, Flame, Medal } from 'lucide-react';
import { Chart } from "react-google-charts";
import TimelineGraph from '../components/TimelineGraph';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const navigate = useNavigate();

    // Core Data State
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('All');

    // KPI State
    const [kpiStats, setKpiStats] = useState({
        totalSolved: 0,
        totalContributions: 0,
        topLeetCode: [],
        topGitHub: [],
        aggregateCalendar: {},
        champions: {
            lc: { solved: { name: '', val: 0 }, streak: { name: '', val: 0 }, longest: { name: '', val: 0 } },
            gh: { contrib: { name: '', val: 0 }, streak: { name: '', val: 0 }, longest: { name: '', val: 0 } }
        },
        top3Ids: []
    });

    const [refreshing, setRefreshing] = useState(false);

    // Admin State
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showAdminMenu, setShowAdminMenu] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchStudents();
    }, [selectedBatch]); // Refetch when batch changes

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = {
                ...(selectedBatch !== 'All' && { batch: selectedBatch }),
                ...(search && { search }),
                trackedOnly: true // Ensure only students with linked accounts are shown
            };
            const { data } = await studentAPI.getAll(params);
            setStudents(data);
            calculateKPIs(data);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    // Get unique batches from data (or hardcode based on known cohorts)
    const batches = ['All', '2022', '2023', '2024', '2025']; // Simplified for now, or could derive from API if needed

    const calculateKPIs = (data) => {
        let solved = 0;
        let contributions = 0;
        let lcAggCalendar = {};
        let ghAggCalendar = {};

        data.forEach(s => {
            solved += (s.leetcodeStats?.totalSolved || 0);
            contributions += (s.githubStats?.totalCommits || 0);

            // LeetCode Timeline Aggregation
            try {
                const lcCalendar = typeof s.leetcodeStats?.submissionCalendar === 'string'
                    ? JSON.parse(s.leetcodeStats.submissionCalendar)
                    : s.leetcodeStats?.submissionCalendar;

                if (lcCalendar) {
                    Object.entries(lcCalendar).forEach(([ts, count]) => {
                        lcAggCalendar[ts] = (lcAggCalendar[ts] || 0) + count;
                    });
                }
            } catch (e) { console.error('Error parsing LC calendar', e); }

            // GitHub Timeline Aggregation
            try {
                const ghCalendar = typeof s.githubStats?.submissionCalendar === 'string'
                    ? JSON.parse(s.githubStats.submissionCalendar)
                    : s.githubStats?.submissionCalendar;

                if (ghCalendar) {
                    Object.entries(ghCalendar).forEach(([date, count]) => {
                        ghAggCalendar[date] = (ghAggCalendar[date] || 0) + count;
                    });
                }
            } catch (e) { console.error('Error parsing GH calendar', e); }
        });

        const getTop = (key, labelKey) => {
            const sorted = [...data].sort((a, b) => {
                const valA = key.split('.').reduce((o, i) => o[i], a) || 0;
                const valB = key.split('.').reduce((o, i) => o[i], b) || 0;
                return valB - valA;
            });

            return sorted.slice(0, 5).map(s => ([
                s.name.split(' ')[0],
                key.split('.').reduce((o, i) => o[i], s) || 0,
                COLORS[Math.floor(Math.random() * COLORS.length)] // Random color for bar
            ]));
        };

        // Find Champions
        const findChamp = (statsKey, valKey) => {
            return data.reduce((max, s) => {
                const val = (s[statsKey]?.[valKey] || 0);
                return val > max.val ? { name: s.name.split(' ')[0], val } : max;
            }, { name: '-', val: -1 });
        };

        const champions = {
            lc: {
                solved: findChamp('leetcodeStats', 'totalSolved'),
                streak: findChamp('leetcodeStats', 'currentStreak'),
                longest: findChamp('leetcodeStats', 'longestStreak')
            },
            gh: {
                contrib: findChamp('githubStats', 'totalCommits'),
                streak: findChamp('githubStats', 'currentStreak'),
                longest: findChamp('githubStats', 'longestStreak')
            }
        };

        // Identify Top 3 for badges
        const top3Ids = [...data]
            .sort((a, b) => b.performanceScore - a.performanceScore)
            .slice(0, 3)
            .map(s => s._id);

        setKpiStats({
            totalSolved: solved,
            totalContributions: contributions,
            topLeetCode: getTop('leetcodeStats.totalSolved'),
            topGitHub: getTop('githubStats.totalCommits'),
            lcAggregateCalendar: lcAggCalendar,
            ghAggregateCalendar: ghAggCalendar,
            champions,
            top3Ids
        });
    };

    // ... handleAdminLogin, handleSearch, useEffect, exportToCSV ...
    const handleAdminLogin = (e) => {
        e.preventDefault();
        if (password === 'admin') {
            setIsAdmin(true);
            setShowLoginModal(false);
            setPassword('');
            setLoginError('');
        } else {
            setLoginError('Incorrect password');
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleRefreshData = async () => {
        setRefreshing(true);
        try {
            await axios.post('http://localhost:5000/api/students/refresh-all');
            await fetchStudents();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const exportToCSV = () => {
        const headers = ['USN', 'Name', 'Section', 'Batch', 'LeetCode Solved', 'GitHub Repos', 'Performance Score'];
        const rows = students.map(s => [
            s.usn,
            s.name,
            s.section,
            s.batch,
            s.leetcodeStats?.totalSolved || 0,
            s.githubStats?.publicRepos || 0,
            s.performanceScore
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student-performance-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const COLORS = ['#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b', '#10b981', '#94a3b8'];

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

    const ChampionCard = ({ icon: Icon, title, name, value, subLabel, colorClass, bgClass }) => (
        <Card className="glass-card hover:-translate-y-1 transition-transform duration-300 !border-slate-300 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${bgClass}`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-lg font-bold text-slate-800">{name}</h4>
                        <span className={`text-sm font-semibold ${colorClass}`}>{value} {subLabel}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-300 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            {/* Admin Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-sm"
                    >
                        <Card className="glass-card shadow-2xl">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Trophy className="w-6 h-6 text-slate-800" />
                                </div>
                                <CardTitle className="text-xl">Admin Access</CardTitle>
                                <CardDescription>Enter password to manage students</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAdminLogin} className="space-y-4">
                                    <Input
                                        type="password"
                                        placeholder="Enter Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="text-center tracking-widest bg-white/50"
                                        autoFocus
                                    />
                                    {loginError && <p className="text-red-500 text-xs text-center font-medium">{loginError}</p>}
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" className="flex-1" onClick={() => setShowLoginModal(false)}>Cancel</Button>
                                        <Button type="submit" className="flex-1 bg-slate-900 text-white hover:bg-slate-800">Login</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Navbar */}
            <nav className="sticky top-0 z-50 glass border-b border-white/20 px-4 md:px-8 py-4 mb-8">
                <div className="w-full px-2 md:px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-2 rounded-lg text-white">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                            PACT
                        </span>
                    </div>

                    <div className="relative">
                        {!isAdmin ? (
                            <Button
                                variant="outline"
                                onClick={() => setShowLoginModal(true)}
                                className="rounded-full border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 bg-white/50"
                            >
                                Admin Dashboard
                            </Button>
                        ) : (
                            <div className="relative">
                                <Button
                                    onClick={() => setShowAdminMenu(!showAdminMenu)}
                                    className="rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-violet-200"
                                >
                                    Admin Controls {showAdminMenu ? '▲' : '▼'}
                                </Button>
                                {showAdminMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 overflow-hidden"
                                    >
                                        <div
                                            className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700 transition"
                                            onClick={() => { navigate('/add-student'); setShowAdminMenu(false); }}
                                        >
                                            <Plus className="w-4 h-4 text-violet-600" /> Add Student
                                        </div>
                                        <div
                                            className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700 transition"
                                            onClick={() => { navigate('/admin/students'); setShowAdminMenu(false); }}
                                        >
                                            <Edit className="w-4 h-4 text-emerald-600" /> Manage Students
                                        </div>
                                        <div
                                            className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700 transition"
                                            onClick={() => { navigate('/bulk-import'); setShowAdminMenu(false); }}
                                        >
                                            <Upload className="w-4 h-4 text-orange-600" /> Bulk Import
                                        </div>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        <div
                                            className="flex items-center gap-2 p-2 hover:bg-red-50 rounded-lg cursor-pointer text-sm font-medium text-red-600 transition"
                                            onClick={() => { setIsAdmin(false); setShowAdminMenu(false); }}
                                        >
                                            <Users className="w-4 h-4" /> Logout
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <motion.div
                className="w-full px-4 md:px-8 pb-12 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >


                {/* Platform Analytics - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* LeetCode Statistics */}
                    <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white/40 border border-slate-300 shadow-sm">
                        <div className="flex flex-row justify-between items-center mb-2">
                            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <Code2 className="w-4 h-4 text-orange-500" /> LeetCode Statistics
                            </h2>
                        </div>

                        {/* KPI */}
                        <motion.div variants={itemVariants}>
                            <Card className="glass-card hover:-translate-y-1 transition-transform duration-300 !border-slate-300 shadow-sm">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 rounded-xl">
                                        <Code2 className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Total Solved</p>
                                        <h3 className="text-3xl font-bold text-slate-800">{loading ? '...' : kpiStats.totalSolved.toLocaleString()}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Champions Row */}
                        {!loading && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <ChampionCard
                                    icon={Trophy}
                                    title="Most Solved"
                                    name={kpiStats.champions.lc.solved.name}
                                    value={kpiStats.champions.lc.solved.val}
                                    subLabel="probs"
                                    bgClass="bg-orange-100"
                                    colorClass="text-orange-600"
                                />
                                <ChampionCard
                                    icon={Flame}
                                    title="Longest"
                                    name={kpiStats.champions.lc.longest.name}
                                    value={kpiStats.champions.lc.longest.val}
                                    subLabel="days"
                                    bgClass="bg-red-100"
                                    colorClass="text-red-600"
                                />
                                <ChampionCard
                                    icon={Zap}
                                    title="Current"
                                    name={kpiStats.champions.lc.streak.name}
                                    value={kpiStats.champions.lc.streak.val}
                                    subLabel="days"
                                    bgClass="bg-yellow-100"
                                    colorClass="text-yellow-600"
                                />
                            </div>
                        )}

                        {/* Activity Graph */}
                        <motion.div variants={itemVariants}>
                            <Card className="glass-card h-80 overflow-hidden !border-slate-300 shadow-sm">
                                <CardContent className="p-0 h-full relative pt-12">
                                    <div className="absolute top-4 left-6 z-10">
                                        <h3 className="font-semibold text-slate-700">Submission Trend</h3>
                                    </div>
                                    <TimelineGraph
                                        type="leetcode"
                                        data={kpiStats.lcAggregateCalendar}
                                        height={320}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Top Solvers Chart */}
                        <motion.div variants={itemVariants}>
                            <Card className="glass-card h-80 !border-slate-300 shadow-sm">
                                <CardContent className="p-4 h-full relative flex flex-col pt-12">
                                    <div className="absolute top-4 left-6 z-10">
                                        <h3 className="font-semibold text-slate-700">Top Solvers</h3>
                                    </div>
                                    <div className="flex-1">
                                        <Chart
                                            chartType="Bar"
                                            data={[
                                                ["Student", "Solved", { role: "style" }],
                                                ...kpiStats.topLeetCode
                                            ]}
                                            options={{
                                                backgroundColor: 'transparent',
                                                legend: { position: 'none' },
                                                chartArea: { width: '80%', height: '70%' },
                                                fontName: 'Outfit',
                                                bars: 'vertical',
                                            }}
                                            width={"100%"}
                                            height={"100%"}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* GitHub Statistics */}
                    <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white/40 border border-slate-300 shadow-sm">
                        <div className="flex flex-row justify-between items-center mb-2">
                            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <Github className="w-4 h-4 text-emerald-500" /> GitHub Statistics
                            </h2>
                        </div>

                        {/* KPI */}
                        <motion.div variants={itemVariants}>
                            <Card className="glass-card hover:-translate-y-1 transition-transform duration-300 !border-slate-300 shadow-sm">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-emerald-100 rounded-xl">
                                        <Github className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Total Contributions</p>
                                        <h3 className="text-3xl font-bold text-slate-800">{loading ? '...' : kpiStats.totalContributions.toLocaleString()}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Champions Row */}
                        {!loading && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <ChampionCard
                                    icon={Code2}
                                    title="Most Contribs"
                                    name={kpiStats.champions.gh.contrib.name}
                                    value={kpiStats.champions.gh.contrib.val}
                                    subLabel="commits"
                                    bgClass="bg-emerald-100"
                                    colorClass="text-emerald-600"
                                />
                                <ChampionCard
                                    icon={Flame}
                                    title="Longest"
                                    name={kpiStats.champions.gh.longest.name}
                                    value={kpiStats.champions.gh.longest.val}
                                    subLabel="days"
                                    bgClass="bg-red-100"
                                    colorClass="text-red-600"
                                />
                                <ChampionCard
                                    icon={Zap}
                                    title="Current"
                                    name={kpiStats.champions.gh.streak.name}
                                    value={kpiStats.champions.gh.streak.val}
                                    subLabel="days"
                                    bgClass="bg-yellow-100"
                                    colorClass="text-yellow-600"
                                />
                            </div>
                        )}

                        {/* Activity Graph */}
                        <motion.div variants={itemVariants}>
                            <Card className="glass-card h-80 overflow-hidden !border-slate-300 shadow-sm">
                                <CardContent className="p-0 h-full relative pt-12">
                                    <div className="absolute top-4 left-6 z-10">
                                        <h3 className="font-semibold text-slate-700">Contribution Trend</h3>
                                    </div>
                                    <TimelineGraph
                                        type="github"
                                        data={kpiStats.ghAggregateCalendar}
                                        height={320}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Top Contributors Chart */}
                        <motion.div variants={itemVariants}>
                            <Card className="glass-card h-80 !border-slate-300 shadow-sm">
                                <CardContent className="p-4 h-full relative flex flex-col pt-12">
                                    <div className="absolute top-4 left-6 z-10">
                                        <h3 className="font-semibold text-slate-700">Top Contributors</h3>
                                    </div>
                                    <div className="flex-1">
                                        <Chart
                                            chartType="Bar"
                                            data={[
                                                ["Student", "Contributions", { role: "style" }],
                                                ...kpiStats.topGitHub
                                            ]}
                                            options={{
                                                backgroundColor: 'transparent',
                                                legend: { position: 'none' },
                                                chartArea: { width: '80%', height: '70%' },
                                                fontName: 'Outfit',
                                                bars: 'vertical',
                                            }}
                                            width={"100%"}
                                            height={"100%"}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Data Grid Section */}
                <motion.div variants={itemVariants}>
                    <Card className="glass-card overflow-hidden !border-slate-300 shadow-sm">
                        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50">
                            {/* Controls */}
                            <div className="flex-1 w-full max-w-lg relative flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        className="pl-10 bg-white border-transparent focus:border-violet-200 focus:ring-violet-100 transition-all rounded-full shadow-sm"
                                        placeholder="Search students..."
                                        value={search}
                                        onChange={handleSearch}
                                    />
                                </div>
                                <select
                                    className="px-4 py-2 rounded-full border-none bg-white shadow-sm text-sm font-medium text-slate-600 focus:ring-2 focus:ring-violet-100 outline-none cursor-pointer"
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                >
                                    {batches.map(batch => (
                                        <option key={batch} value={batch}>{batch === 'All' ? 'All Batches' : `Batch ${batch}`}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleRefreshData}
                                    disabled={refreshing}
                                    className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                                </Button>
                                <Button variant="outline" onClick={exportToCSV} className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50">
                                    <Download className="w-4 h-4 mr-2" /> CSV
                                </Button>
                            </div>
                        </div>


                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="text-left p-4 pl-6">Student Info</th>
                                        <th className="text-center p-4">Cohort</th>
                                        <th className="text-center p-4">LeetCode</th>
                                        <th className="text-center p-4">GitHub</th>
                                        <th className="text-center p-4">Score</th>
                                        <th className="text-center p-4 pr-6">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {students.map((student) => (
                                        <motion.tr
                                            key={student._id}
                                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                                            className="transition-colors group"
                                        >
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    {kpiStats.top3Ids[0] === student._id && <Medal className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                                                    {kpiStats.top3Ids[1] === student._id && <Medal className="w-5 h-5 text-gray-400 fill-gray-400" />}
                                                    {kpiStats.top3Ids[2] === student._id && <Medal className="w-5 h-5 text-amber-700 fill-amber-700" />}
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{student.name}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{student.usn}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                    {student.section} - {student.batch}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-bold text-orange-600">{student.leetcodeStats?.totalSolved || 0}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase">Solved</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-bold text-emerald-600">{student.githubStats?.totalCommits || 0}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase">Contribs</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="font-bold text-violet-600 text-lg">{student.performanceScore}</div>
                                            </td>
                                            <td className="p-4 pr-6 text-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => navigate(`/student/${student._id}`)}
                                                    className="text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-full"
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
