import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { studentAPI } from '../lib/apiClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Search, MoreVertical, Trophy, Users, Code2, Github, Download, Plus, Edit, Upload, RefreshCw, Zap, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import TimelineGraph from '../components/TimelineGraph';
import Logo from '../components/Logo';
import { motion } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';
import { useToast } from '../contexts/ToastContext';

export default function Dashboard() {
    const navigate = useNavigate();
    const { addToast } = useToast();

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


    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });

    // Initial Fetch
    useEffect(() => {
        fetchStudents();
    }, [selectedBatch]); // Refetch when batch changes

    const fetchStudents = async (showFullLoader = true) => {
        try {
            if (showFullLoader) setLoading(true);
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
            if (!showFullLoader) addToast("Failed to update data", "error");
        } finally {
            if (showFullLoader) setLoading(false);
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

            return sorted.slice(0, 5).map(s => ({
                name: s.name.split(' ')[0],
                value: key.split('.').reduce((o, i) => o[i], s) || 0,
                fill: COLORS[Math.floor(Math.random() * COLORS.length)]
            }));
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
            await fetchStudents(false);
            addToast('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            addToast('Failed to refresh data', 'error');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Sorting Logic
    const sortedStudents = [...students].sort((a, b) => {
        let aValue = 0;
        let bValue = 0;

        switch (sortConfig.key) {
            case 'leetcode':
                aValue = a.leetcodeStats?.totalSolved || 0;
                bValue = b.leetcodeStats?.totalSolved || 0;
                break;
            case 'github':
                aValue = a.githubStats?.totalCommits || 0;
                bValue = b.githubStats?.totalCommits || 0;
                break;
            case 'score':
                aValue = a.performanceScore || 0;
                bValue = b.performanceScore || 0;
                break;
            default:
                return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <div className="w-4 h-4" />; // Placeholder
        return <span className="ml-1 text-xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

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
            <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
                <div className={`p-1.5 md:p-3 rounded-xl ${bgClass}`}>
                    <Icon className={`w-3.5 h-3.5 md:w-5 md:h-5 ${colorClass}`} />
                </div>
                <div>
                    <p className="text-[9px] md:text-xs font-medium text-slate-500 uppercase tracking-widest">{title}</p>
                    <div className="flex items-baseline gap-1.5 md:gap-2">
                        <h4 className="text-sm md:text-lg font-bold text-slate-800">{name}</h4>
                        <span className={`text-[10px] md:text-sm font-semibold ${colorClass}`}>{value} {subLabel}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-300 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>


            {/* Navbar */}
            <nav className="sticky top-0 z-50 glass border-b border-white/20 px-4 md:px-8 py-4 mb-8">
                <div className="w-full px-2 md:px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
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

                    <div className="relative">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin')}
                            className="rounded-full border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 bg-white/50 h-8 px-3 text-xs md:h-10 md:px-4 md:text-sm"
                        >
                            Admin Dashboard
                        </Button>
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
                                <CardContent className="p-3 md:p-6 flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-3 bg-orange-100 rounded-xl">
                                        <Code2 className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-slate-500">Total Solved</p>
                                        <h3 className="text-xl md:text-3xl font-bold text-slate-800">{loading ? '...' : kpiStats.totalSolved.toLocaleString()}</h3>
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
                                    title="Longest Streak"
                                    name={kpiStats.champions.lc.longest.name}
                                    value={kpiStats.champions.lc.longest.val}
                                    subLabel="days"
                                    bgClass="bg-red-100"
                                    colorClass="text-red-600"
                                />
                                <ChampionCard
                                    icon={Zap}
                                    title="Current Longest"
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
                            <Card className="bg-transparent overflow-hidden !border-slate-300 shadow-sm">
                                <CardContent className="p-3 md:p-6">
                                    <h3 className="font-semibold text-slate-700 mb-4">Submission Trend</h3>
                                    <div className="w-full h-40 md:h-64">
                                        <TimelineGraph
                                            type="leetcode"
                                            data={kpiStats.lcAggregateCalendar}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Top Solvers Chart */}
                        <motion.div variants={itemVariants}>
                            <div className="bg-transparent !border-slate-300 shadow-sm rounded-xl border overflow-hidden">
                                <div className="p-3 md:p-6">
                                    <h3 className="font-semibold text-slate-700 mb-4">Top Solvers</h3>
                                    <div className="w-full h-40 md:h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={kpiStats.topLeetCode} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 10, fill: '#64748b' }} 
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 10, fill: '#64748b' }} 
                                                    width={30}
                                                />
                                                <Tooltip 
                                                    cursor={{ fill: 'transparent' }}
                                                    formatter={(value) => [value, 'Solved']}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                                    labelStyle={{ color: '#666' }}
                                                />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                    {kpiStats.topLeetCode.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
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
                                <CardContent className="p-3 md:p-6 flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-3 bg-emerald-100 rounded-xl">
                                        <Github className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-slate-500">Total Contributions</p>
                                        <h3 className="text-xl md:text-3xl font-bold text-slate-800">{loading ? '...' : kpiStats.totalContributions.toLocaleString()}</h3>
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
                                    title="Longest Streak"
                                    name={kpiStats.champions.gh.longest.name}
                                    value={kpiStats.champions.gh.longest.val}
                                    subLabel="days"
                                    bgClass="bg-red-100"
                                    colorClass="text-red-600"
                                />
                                <ChampionCard
                                    icon={Zap}
                                    title="Current Longest"
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
                            <Card className="bg-transparent overflow-hidden !border-slate-300 shadow-sm">
                                <CardContent className="p-3 md:p-6">
                                    <h3 className="font-semibold text-slate-700 mb-4">Contribution Trend</h3>
                                    <div className="w-full h-40 md:h-64">
                                        <TimelineGraph
                                            type="github"
                                            data={kpiStats.ghAggregateCalendar}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Top Contributors Chart */}
                        <motion.div variants={itemVariants}>
                            <div className="bg-transparent !border-slate-300 shadow-sm rounded-xl border overflow-hidden">
                                <div className="p-3 md:p-6">
                                    <h3 className="font-semibold text-slate-700 mb-4">Top Contributors</h3>
                                    <div className="w-full h-40 md:h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={kpiStats.topGitHub} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 10, fill: '#64748b' }} 
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 10, fill: '#64748b' }} 
                                                    width={30}
                                                />
                                                <Tooltip 
                                                    cursor={{ fill: 'transparent' }}
                                                    formatter={(value) => [value, 'Contributions']}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                                    labelStyle={{ color: '#666' }}
                                                />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                    {kpiStats.topGitHub.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
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


                        <div className="overflow-x-auto px-4 md:px-8">
                            <table className="w-full border-separate border-spacing-y-2 md:border-spacing-y-3">
                                <thead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="text-left py-2 pl-2 pr-1 md:p-4 md:pl-6 text-[10px] md:text-xs">Student</th>
                                        <th className="hidden md:table-cell text-center p-4">Cohort</th>
                                        <th 
                                            className="text-center py-2 px-1 md:p-4 text-[10px] md:text-xs cursor-pointer hover:bg-slate-50 transition select-none group"
                                            onClick={() => requestSort('leetcode')}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="md:hidden">LC</span>
                                                <span className="hidden md:inline">LeetCode</span>
                                                <SortIcon columnKey="leetcode" />
                                            </div>
                                        </th>
                                        <th 
                                            className="text-center py-2 px-1 md:p-4 text-[10px] md:text-xs cursor-pointer hover:bg-slate-50 transition select-none group"
                                            onClick={() => requestSort('github')}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="md:hidden">GH</span>
                                                <span className="hidden md:inline">GitHub</span>
                                                <SortIcon columnKey="github" />
                                            </div>
                                        </th>
                                        <th 
                                            className="text-center py-2 px-1 md:p-4 text-[10px] md:text-xs cursor-pointer hover:bg-slate-50 transition select-none group"
                                            onClick={() => requestSort('score')}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                Score <SortIcon columnKey="score" />
                                            </div>
                                        </th>
                                        <th className="text-center py-2 pr-2 pl-1 md:p-4 md:pr-6 text-[10px] md:text-xs">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedStudents.map((student) => {
                                        const isFirst = kpiStats.top3Ids[0] === student._id;
                                        const isSecond = kpiStats.top3Ids[1] === student._id;
                                        const isThird = kpiStats.top3Ids[2] === student._id;

                                        let baseClass = "transition-colors duration-200 border-y py-2 md:py-4";
                                        let leftClass = "border-l rounded-l-xl pl-2 md:pl-6";
                                        let rightClass = "border-r rounded-r-xl pr-2 md:pr-6";
                                        
                                        if (isFirst) {
                                            const colorClass = " bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300";
                                            baseClass += colorClass;
                                            leftClass += colorClass;
                                            rightClass += colorClass;
                                        } else if (isSecond) {
                                            const colorClass = " bg-gradient-to-r from-slate-50 to-gray-100 border-slate-300";
                                            baseClass += colorClass;
                                            leftClass += colorClass;
                                            rightClass += colorClass;
                                        } else if (isThird) {
                                            const colorClass = " bg-gradient-to-r from-orange-50 to-rose-50 border-orange-300";
                                            baseClass += colorClass;
                                            leftClass += colorClass;
                                            rightClass += colorClass;
                                        } else {
                                            const colorClass = " bg-white border-slate-200 hover:bg-slate-50";
                                            baseClass += colorClass;
                                            leftClass += colorClass;
                                            rightClass += colorClass;
                                        }

                                        return (
                                            <motion.tr
                                                key={student._id}
                                                whileHover={{ scale: 1.01, backgroundColor: "rgba(248, 250, 252, 0.8)" }}
                                                onClick={() => navigate(`/student/${student._id}`)}
                                                className="drop-shadow-sm hover:drop-shadow-md transition-all cursor-pointer group"
                                            >
                                                <td className={`${baseClass} ${leftClass}`}>
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-xs md:text-sm max-w-[80px] md:max-w-none truncate group-hover:text-violet-700 transition-colors">{student.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono hidden sm:block">{student.usn}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`${baseClass} text-center hidden md:table-cell`}>
                                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100/80 border border-slate-200 text-slate-800">
                                                        {student.section} - {student.batch}
                                                    </div>
                                                </td>
                                                <td className={`${baseClass} text-center`}>
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-bold text-orange-600 text-xs md:text-base">{student.leetcodeStats?.totalSolved || 0}</span>
                                                        <span className="text-[8px] md:text-[10px] text-slate-400 uppercase">Solved</span>
                                                    </div>
                                                </td>
                                                <td className={`${baseClass} text-center`}>
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-bold text-emerald-600 text-xs md:text-base">{student.githubStats?.totalCommits || 0}</span>
                                                        <span className="text-[8px] md:text-[10px] text-slate-400 uppercase">Contribs</span>
                                                    </div>
                                                </td>
                                                <td className={`${baseClass} text-center`}>
                                                    <div className="font-bold text-violet-600 text-xs md:text-lg">{student.performanceScore}</div>
                                                </td>
                                                <td className={`${baseClass} ${rightClass} text-center`}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/student/${student._id}`); }}
                                                        className="text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-full h-7 w-7 p-0 md:h-9 md:w-auto md:px-3"
                                                    >
                                                        <span className="block md:hidden">➜</span>
                                                        <span className="hidden md:block">View</span>
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Self-Service Update Link */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
                            <p className="text-sm text-slate-500 mb-3">Don't see your updated stats? Make sure your links are correct.</p>
                            <Button 
                                variant="outline" 
                                onClick={() => navigate('/update-profile')}
                                className="bg-white hover:bg-violet-50 text-violet-600 border-violet-200 hover:border-violet-300 transition-colors rounded-full"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Fill Your Information
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
