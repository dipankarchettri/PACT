import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Save,
    Search,
    ArrowLeft,
    Trophy,
    Lock,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { studentAPI } from '../lib/apiClient';

export default function AdminStudentManager() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [savingId, setSavingId] = useState(null);

    // Password Protection
    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin') {
            setIsAuthenticated(true);
            setError('');
            fetchStudents();
        } else {
            setError('Incorrect password');
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const { data } = await studentAPI.getAll();
            // Add local status field for UI feedback
            const mapped = data.map(s => ({
                ...s,
                status: 'idle', // idle, success, error
                message: ''
            }));
            setStudents(mapped);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (id, field, value) => {
        setStudents(prev => prev.map(s =>
            s._id === id ? { ...s, [field]: value, status: 'idle', message: '' } : s
        ));
    };

    const handleSave = async (student) => {
        setSavingId(student._id);
        try {
            // Optimistic status update not needed here as we want to wait for validation
            await studentAPI.update(student._id, {
                name: student.name,
                usn: student.usn,
                section: student.section,
                batch: parseInt(student.batch),
                githubUsername: student.githubUsername,
                leetcodeUsername: student.leetcodeUsername,
                linkedinUrl: student.linkedinUrl
            });

            setStudents(prev => prev.map(s =>
                s._id === student._id ? { ...s, status: 'success', message: 'Saved' } : s
            ));

            // Clear success message after 3 seconds
            setTimeout(() => {
                setStudents(prev => prev.map(s =>
                    s._id === student._id ? { ...s, status: 'idle', message: '' } : s
                ));
            }, 3000);

        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed';
            let details = '';
            if (error.response?.data?.details) {
                details = ': ' + error.response?.data?.details.join(', ');
            }

            setStudents(prev => prev.map(s =>
                s._id === student._id ? { ...s, status: 'error', message: errorMsg + details } : s
            ));
        } finally {
            setSavingId(null);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.usn.toLowerCase().includes(search.toLowerCase())
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-200 rounded-full blur-[100px]"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md"
                >
                    <Card className="glass-card border-none shadow-2xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-8 h-8 text-slate-500" />
                            </div>
                            <CardTitle className="text-2xl">Admin Verify</CardTitle>
                            <CardDescription>Enter password to manage student data</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <Input
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/50 text-center text-lg tracking-widest"
                                    autoFocus
                                />
                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
                                    Unlock Manager
                                </Button>
                                <Button variant="ghost" type="button" onClick={() => navigate('/')} className="w-full">
                                    Cancel
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans relative">
            <nav className="sticky top-0 z-50 glass border-b border-white/20 px-8 py-4 mb-8">
                <div className="w-full px-6 flex justify-between items-center">
                    <div
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                        onClick={() => navigate('/')}
                    >
                        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-2 rounded-lg text-white">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                            PACT
                        </span>
                        <span className="text-slate-400 font-medium ml-2">| Student Manager</span>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                </div>
            </nav>

            <motion.div
                className="w-full px-8 pb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/40 shadow-sm overflow-hidden min-h-[80vh]">

                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/50 sticky top-0 z-10">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                className="pl-10 bg-white border-slate-200"
                                placeholder="Search by name or USN..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-slate-500">
                            Showing {filteredStudents.length} students
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto h-[calc(100vh-250px)]">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-4 text-left font-semibold text-slate-600 w-64">Student Info</th>
                                        <th className="p-4 text-left font-semibold text-slate-600 w-24">Batch</th>
                                        <th className="p-4 text-left font-semibold text-slate-600 w-24">Sec</th>
                                        <th className="p-4 text-left font-semibold text-slate-600 w-48">GitHub Username</th>
                                        <th className="p-4 text-left font-semibold text-slate-600 w-48">LeetCode Username</th>
                                        <th className="p-4 text-left font-semibold text-slate-600 w-48">LinkedIn URL</th>
                                        <th className="p-4 text-center font-semibold text-slate-600 w-40">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.map((student) => (
                                        <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4 align-top">
                                                <Input
                                                    value={student.name}
                                                    onChange={(e) => handleInputChange(student._id, 'name', e.target.value)}
                                                    className="font-bold border-transparent hover:border-slate-200 focus:border-violet-200 mb-1 h-8 px-2 -mx-2 bg-transparent"
                                                />
                                                <Input
                                                    value={student.usn}
                                                    onChange={(e) => handleInputChange(student._id, 'usn', e.target.value)}
                                                    className="font-mono text-xs text-slate-500 border-transparent hover:border-slate-200 focus:border-violet-200 h-6 px-2 -mx-2 bg-transparent"
                                                />
                                            </td>
                                            <td className="p-4 align-top">
                                                <Input
                                                    type="number"
                                                    value={student.batch}
                                                    onChange={(e) => handleInputChange(student._id, 'batch', e.target.value)}
                                                    className="border-transparent hover:border-slate-200 focus:border-violet-200 bg-transparent"
                                                />
                                            </td>
                                            <td className="p-4 align-top">
                                                <Input
                                                    value={student.section}
                                                    onChange={(e) => handleInputChange(student._id, 'section', e.target.value)}
                                                    className="border-transparent hover:border-slate-200 focus:border-violet-200 bg-transparent"
                                                />
                                            </td>
                                            <td className="p-4 align-top">
                                                <Input
                                                    value={student.githubUsername || ''}
                                                    onChange={(e) => handleInputChange(student._id, 'githubUsername', e.target.value)}
                                                    placeholder="-"
                                                    className="border-transparent hover:border-slate-200 focus:border-violet-200 bg-transparent text-slate-600"
                                                />
                                            </td>
                                            <td className="p-4 align-top">
                                                <Input
                                                    value={student.leetcodeUsername || ''}
                                                    onChange={(e) => handleInputChange(student._id, 'leetcodeUsername', e.target.value)}
                                                    placeholder="-"
                                                    className="border-transparent hover:border-slate-200 focus:border-violet-200 bg-transparent text-slate-600"
                                                />
                                            </td>
                                            <td className="p-4 align-top">
                                                <Input
                                                    value={student.linkedinUrl || ''}
                                                    onChange={(e) => handleInputChange(student._id, 'linkedinUrl', e.target.value)}
                                                    placeholder="-"
                                                    className="border-transparent hover:border-slate-200 focus:border-violet-200 bg-transparent text-slate-600 text-xs truncate"
                                                />
                                            </td>
                                            <td className="p-4 align-top text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSave(student)}
                                                        disabled={savingId === student._id}
                                                        className={`w-full ${student.status === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800'} text-white transition-all`}
                                                    >
                                                        {savingId === student._id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                        ) : student.status === 'success' ? (
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                        ) : (
                                                            <Save className="w-3 h-3 mr-1" />
                                                        )}
                                                        {savingId === student._id ? 'Validating...' : student.status === 'success' ? 'Saved' : 'Save'}
                                                    </Button>

                                                    {student.status === 'error' && (
                                                        <span className="text-[10px] text-red-500 font-medium leading-tight max-w-[120px] block">
                                                            {student.message || 'Error'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
