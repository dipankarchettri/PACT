import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Save,
    Search,
    ArrowLeft,
    Lock,
    CheckCircle,
    AlertCircle,
    Loader2,
    Trash2,
    X,
    Edit
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { studentAPI } from '../lib/apiClient';
import Logo from '../components/Logo';
import LoadingScreen from '../components/LoadingScreen';
import { useToast } from '../contexts/ToastContext';

import { useAdmin } from '../contexts/AdminContext';

export default function AdminStudentManager() {
    const navigate = useNavigate();
    const { isAdmin } = useAdmin();
    const { addToast } = useToast();
    
    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin) {
            navigate('/admin');
        } else {
            fetchStudents();
        }
    }, [isAdmin, navigate]);

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [savingId, setSavingId] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await studentAPI.delete(studentToDelete._id);
            // Remove from list
            setStudents(prev => prev.filter(s => s._id !== studentToDelete._id));
            setDeleteModalOpen(false);
            setStudentToDelete(null);
            addToast('Student deleted successfully', 'success');
        } catch (error) {
            console.error(error);
            addToast("Failed to delete student", 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditClick = (student) => {
        setEditingStudent({ ...student });
        setEditModalOpen(true);
    };

    const handleEditSave = async () => {
        if (!editingStudent) return;
        
        // Use the existing handleSave logic but wrapper for the modal
        await handleSave(editingStudent);
        setEditModalOpen(false);
        setEditingStudent(null);
    };

    const handleEditInputChange = (field, value) => {
        setEditingStudent(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.usn.toLowerCase().includes(search.toLowerCase())
    );


    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans relative">
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
                        <span className="hidden sm:inline text-slate-400 font-medium ml-2 self-center pt-1">| Student Manager</span>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/admin')} className="text-slate-500 hover:text-slate-800">
                        <ArrowLeft className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                </div>
            </nav>

            <motion.div
                className="w-full px-4 md:px-8 pb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/40 shadow-sm overflow-hidden min-h-[80vh]">

                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-white/50 sticky top-0 z-10 gap-4">
                        <div className="relative w-full sm:w-96">
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
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-4 text-left font-semibold text-slate-600 w-64">Student Info</th>
                                        <th className="hidden md:table-cell p-4 text-left font-semibold text-slate-600 w-24">Batch</th>
                                        <th className="hidden md:table-cell p-4 text-left font-semibold text-slate-600 w-24">Sec</th>
                                        <th className="hidden md:table-cell p-4 text-left font-semibold text-slate-600 w-48">GitHub Username</th>
                                        <th className="hidden md:table-cell p-4 text-left font-semibold text-slate-600 w-48">LeetCode Username</th>
                                        <th className="hidden md:table-cell p-4 text-left font-semibold text-slate-600 w-48">LinkedIn URL</th>
                                        <th className="p-4 text-center font-semibold text-slate-600 w-40">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.map((student) => (
                                        <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4 align-top">
                                                {/* Mobile: Static Text */}
                                                <div className="md:hidden">
                                                    <div className="font-bold text-slate-900">{student.name}</div>
                                                    <div className="text-xs font-mono text-slate-500">{student.usn}</div>
                                                </div>
                                                {/* Desktop: Inputs */}
                                                <div className="hidden md:block">
                                                    <Input
                                                        value={student.name}
                                                        onChange={(e) => handleInputChange(student._id, 'name', e.target.value)}
                                                        className="font-bold border-slate-300 hover:border-slate-400 focus:border-violet-200 mb-1 h-8 px-2 -mx-2 bg-transparent"
                                                    />
                                                    <Input
                                                        value={student.usn}
                                                        onChange={(e) => handleInputChange(student._id, 'usn', e.target.value)}
                                                        className="font-mono text-xs text-slate-500 border-slate-300 hover:border-slate-400 focus:border-violet-200 h-6 px-2 -mx-2 bg-transparent"
                                                    />
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell p-4 align-top">
                                                <Input
                                                    type="number"
                                                    value={student.batch}
                                                    onChange={(e) => handleInputChange(student._id, 'batch', e.target.value)}
                                                    className="border-slate-300 hover:border-slate-400 focus:border-violet-200 bg-transparent"
                                                />
                                            </td>
                                            <td className="hidden md:table-cell p-4 align-top">
                                                <Input
                                                    value={student.section}
                                                    onChange={(e) => handleInputChange(student._id, 'section', e.target.value)}
                                                    className="border-slate-300 hover:border-slate-400 focus:border-violet-200 bg-transparent mb-1 h-8 px-2 -mx-2 text-xs"
                                                />
                                                <Input
                                                    value={student.phoneNumber || ''}
                                                    onChange={(e) => handleInputChange(student._id, 'phoneNumber', e.target.value)}
                                                    placeholder="Phone"
                                                    className="border-slate-300 hover:border-slate-400 focus:border-violet-200 bg-transparent h-8 px-2 -mx-2 text-xs"
                                                />
                                            </td>
                                            <td className="hidden md:table-cell p-4 align-top">
                                                <Input
                                                    value={student.githubUsername || ''}
                                                    onChange={(e) => handleInputChange(student._id, 'githubUsername', e.target.value)}
                                                    placeholder="-"
                                                    className="border-slate-300 hover:border-slate-400 focus:border-violet-200 bg-transparent text-slate-600"
                                                />
                                            </td>
                                            <td className="hidden md:table-cell p-4 align-top">
                                                <Input
                                                    value={student.leetcodeUsername || ''}
                                                    onChange={(e) => handleInputChange(student._id, 'leetcodeUsername', e.target.value)}
                                                    placeholder="-"
                                                    className="border-slate-300 hover:border-slate-400 focus:border-violet-200 bg-transparent text-slate-600"
                                                />
                                            </td>
                                            <td className="hidden md:table-cell p-4 align-top">
                                                <Input
                                                    value={student.linkedinUrl || ''}
                                                    onChange={(e) => handleInputChange(student._id, 'linkedinUrl', e.target.value)}
                                                    placeholder="-"
                                                    className="border-slate-300 hover:border-slate-400 focus:border-violet-200 bg-transparent text-slate-600 text-xs truncate"
                                                />
                                            </td>
                                            <td className="p-4 align-top text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    {/* Desktop: Save Button */}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSave(student)}
                                                        disabled={savingId === student._id}
                                                        className={`hidden md:flex w-full ${student.status === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800'} text-white transition-all`}
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

                                                    {/* Mobile: Edit Button */}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleEditClick(student)}
                                                        className="md:hidden w-full bg-slate-900 text-white hover:bg-slate-800"
                                                    >
                                                        <Save className="w-3 h-3 mr-1" /> Edit
                                                    </Button>

                                                    {student.status === 'error' && (
                                                        <span className="text-[10px] text-red-500 font-medium leading-tight max-w-[120px] block">
                                                            {student.message || 'Error'}
                                                        </span>
                                                    )}
                                                    
                                                    <Button
                                                        size="sm"
                                                        variant="ghost" 
                                                        onClick={() => handleDeleteClick(student)}
                                                        className="h-7 px-3 text-xs w-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Edit Modal (Mobile Only) */}
                    {editModalOpen && editingStudent && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm md:hidden">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Edit className="w-4 h-4 text-violet-600" />
                                        Edit Student
                                    </h3>
                                    <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="p-6 space-y-4 overflow-y-auto">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Student Info</label>
                                        <Input
                                            value={editingStudent.name}
                                            onChange={(e) => handleEditInputChange('name', e.target.value)}
                                            placeholder="Full Name"
                                            className="font-bold"
                                        />
                                        <Input
                                            value={editingStudent.usn}
                                            onChange={(e) => handleEditInputChange('usn', e.target.value)}
                                            placeholder="USN"
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Batch</label>
                                            <Input
                                                type="number"
                                                value={editingStudent.batch}
                                                onChange={(e) => handleEditInputChange('batch', e.target.value)}
                                                placeholder="Year"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Section</label>
                                            <Input
                                                value={editingStudent.section}
                                                onChange={(e) => handleEditInputChange('section', e.target.value)}
                                                placeholder="Sec"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Phone</label>
                                        <Input
                                            value={editingStudent.phoneNumber || ''}
                                            onChange={(e) => handleEditInputChange('phoneNumber', e.target.value)}
                                            placeholder="Phone Number"
                                        />
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">GitHub</label>
                                            <Input
                                                value={editingStudent.githubUsername || ''}
                                                onChange={(e) => handleEditInputChange('githubUsername', e.target.value)}
                                                placeholder="GitHub Username"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">LeetCode</label>
                                            <Input
                                                value={editingStudent.leetcodeUsername || ''}
                                                onChange={(e) => handleEditInputChange('leetcodeUsername', e.target.value)}
                                                placeholder="LeetCode Username"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase">LinkedIn</label>
                                            <Input
                                                value={editingStudent.linkedinUrl || ''}
                                                onChange={(e) => handleEditInputChange('linkedinUrl', e.target.value)}
                                                placeholder="LinkedIn URL"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10 flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setEditModalOpen(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleEditSave}
                                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {deleteModalOpen && studentToDelete && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
                            >
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        Confirm Deletion
                                    </h3>
                                    <button onClick={() => setDeleteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <p className="text-sm text-slate-600">
                                        Are you sure you want to delete <span className="font-bold text-slate-900">{studentToDelete.name}</span> ({studentToDelete.usn})?
                                        This action cannot be undone.
                                    </p>
                                    
                                    <div className="flex gap-2 pt-4">
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setDeleteModalOpen(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            onClick={handleDeleteConfirm}
                                            disabled={isDeleting}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Student'}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
