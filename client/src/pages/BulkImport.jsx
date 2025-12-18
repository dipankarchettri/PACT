import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import {
    Upload,
    FileText,
    Lock,
    X,
    Save,
    CheckCircle,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { studentAPI } from '../lib/apiClient';
import { useToast } from '../contexts/ToastContext';

import { useAdmin } from '../contexts/AdminContext';

export default function BulkImport() {
    const navigate = useNavigate();
    const { isAdmin } = useAdmin();
    const { addToast } = useToast();
    
    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin) {
            navigate('/admin');
        }
    }, [isAdmin, navigate]);

    const [file, setFile] = useState(null);

    // File Upload Logic
    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        setFile(file);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
            complete: (results) => {
                const standardizedData = results.data.map((row, index) => ({
                    id: index,
                    name: row['NAME'] || '',
                    usn: row['USN'] || '',
                    email: row['PROFESSIONAL EMAIL ID'] || row['PERSONAL EMAIL ID'] || '',
                    phoneNumber: row['CONTACT NUMBER'] || '',
                    section: globalSection,
                    batch: globalBatch,
                    githubUsername: '',
                    leetcodeUsername: '',
                    linkedinUrl: '',
                    status: 'pending', // pending, success, error
                    message: ''
                })).filter(row => row.name && row.usn); // Filter out empty rows

                setParsedData(standardizedData);
            }
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv']
        },
        multiple: false
    });

    // Handle Input Change for Table
    const handleInputChange = (id, field, value) => {
        setParsedData(prev => prev.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    // Save Individual Student
    const saveStudent = async (student) => {
        try {
            // Update status to loading
            setParsedData(prev => prev.map(row =>
                row.id === student.id ? { ...row, status: 'loading' } : row
            ));

            // Call API
            await studentAPI.create({
                name: student.name,
                usn: student.usn,
                email: student.email,
                phoneNumber: student.phoneNumber,
                section: student.section,
                batch: parseInt(student.batch),
                githubUsername: student.githubUsername,
                leetcodeUsername: student.leetcodeUsername,
                linkedinUrl: student.linkedinUrl
            });

            // Update status to success
            setParsedData(prev => prev.map(row =>
                row.id === student.id ? { ...row, status: 'success', message: 'Saved successfully' } : row
            ));
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to save';

            setParsedData(prev => prev.map(row =>
                row.id === student.id ? { ...row, status: 'error', message: errorMsg } : row
            ));
        }
    };

    // Bulk Save
    const handleBulkSave = async () => {
        setImporting(true);
        for (const student of parsedData) {
            if (student.status !== 'success' && student.status !== 'skipped') {
                await saveStudent(student);
            }
        }
        setImporting(false);
        addToast('Bulk save operation completed', 'info');
    };

    // Global defaults for missing fields
    const [globalBatch, setGlobalBatch] = useState(new Date().getFullYear());
    const [globalSection, setGlobalSection] = useState('A');

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
                        <span className="hidden sm:inline text-slate-400 font-medium ml-2 self-center pt-1">| Bulk Import</span>
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
                {!parsedData.length ? (
                    <div className="max-w-3xl mx-auto space-y-8">
                        <Card className="glass-card mb-8">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Default Batch Year</label>
                                        <Input
                                            type="number"
                                            value={globalBatch}
                                            onChange={(e) => setGlobalBatch(parseInt(e.target.value))}
                                            className="bg-white/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Default Section</label>
                                        <Input
                                            value={globalSection}
                                            onChange={(e) => setGlobalSection(e.target.value)}
                                            className="bg-white/50"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div
                            {...getRootProps()}
                            className={`border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-violet-500 bg-violet-50/50' : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-sm flex items-center justify-center">
                                <Upload className="w-8 h-8 text-violet-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Upload Student CSV</h3>
                            <p className="text-slate-500 mb-6">Drag & drop your file here, or click to browse</p>
                            <div className="text-xs text-slate-400 font-mono bg-slate-100 inline-block px-4 py-2 rounded-lg">
                                Expected: USN, NAME, PROFESSIONAL EMAIL ID, CONTACT NUMBER
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl border border-slate-200 backdrop-blur-sm sticky top-24 z-40 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{file.name}</h3>
                                    <p className="text-xs text-slate-500">{parsedData.length} students found</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setParsedData([])} className="bg-white">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleBulkSave}
                                    disabled={importing}
                                    className="bg-slate-900 text-white hover:bg-slate-800"
                                >
                                    {importing ? 'Saving All...' : 'Save All Students'}
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/40 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-4 text-left font-semibold text-slate-600">Row</th>
                                            <th className="p-4 text-left font-semibold text-slate-600">Student Info (Read-Only)</th>
                                            <th className="p-4 text-left font-semibold text-slate-600 w-24">Batch</th>
                                            <th className="p-4 text-left font-semibold text-slate-600 w-24">Sec</th>
                                            <th className="p-4 text-left font-semibold text-slate-600">Contact</th>
                                            <th className="p-4 text-left font-semibold text-slate-600 w-48">GitHub</th>
                                            <th className="p-4 text-left font-semibold text-slate-600 w-48">LeetCode</th>
                                            <th className="p-4 text-left font-semibold text-slate-600 w-48">LinkedIn</th>
                                            <th className="p-4 text-center font-semibold text-slate-600 w-32">Status</th>
                                            <th className="p-4 text-center font-semibold text-slate-600 w-24">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {parsedData.map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 text-slate-400 font-mono text-xs">{row.id + 1}</td>
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-800">{row.name}</div>
                                                    <div className="font-mono text-xs text-slate-500">{row.usn}</div>
                                                </td>
                                                <td className="p-4">
                                                    <Input
                                                        value={row.batch}
                                                        onChange={(e) => handleInputChange(row.id, 'batch', e.target.value)}
                                                        className="h-8 text-xs bg-white/50"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <Input
                                                        value={row.section}
                                                        onChange={(e) => handleInputChange(row.id, 'section', e.target.value)}
                                                        className="h-8 text-xs bg-white/50"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <Input
                                                            value={row.email}
                                                            onChange={(e) => handleInputChange(row.id, 'email', e.target.value)}
                                                            placeholder="Email"
                                                            className="h-8 text-xs bg-white/50"
                                                        />
                                                        <Input
                                                            value={row.phoneNumber}
                                                            onChange={(e) => handleInputChange(row.id, 'phoneNumber', e.target.value)}
                                                            placeholder="Phone"
                                                            className="h-8 text-xs bg-white/50"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Input
                                                        value={row.githubUsername}
                                                        onChange={(e) => handleInputChange(row.id, 'githubUsername', e.target.value)}
                                                        placeholder="username"
                                                        className="h-8 text-xs bg-white/50"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <Input
                                                        value={row.leetcodeUsername}
                                                        onChange={(e) => handleInputChange(row.id, 'leetcodeUsername', e.target.value)}
                                                        placeholder="username"
                                                        className="h-8 text-xs bg-white/50"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <Input
                                                        value={row.linkedinUrl}
                                                        onChange={(e) => handleInputChange(row.id, 'linkedinUrl', e.target.value)}
                                                        placeholder="https://..."
                                                        className="h-8 text-xs bg-white/50"
                                                    />
                                                </td>
                                                <td className="p-4 text-center">
                                                    {row.status === 'success' && <span className="text-green-600 text-xs font-bold flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Saved</span>}
                                                    {row.status === 'error' && <span className="text-red-500 text-xs font-bold flex items-center justify-center gap-1" title={row.message}><AlertCircle className="w-3 h-3" /> Error</span>}
                                                    {row.status === 'skipped' && <span className="text-amber-500 text-xs font-bold flex items-center justify-center gap-1" title={row.message}><AlertCircle className="w-3 h-3" /> Skipped</span>}
                                                    {row.status === 'loading' && <span className="text-slate-400 text-xs animate-pulse">Saving...</span>}
                                                    {row.status === 'pending' && <span className="text-slate-300 text-xs">-</span>}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => saveStudent(row)}
                                                        disabled={row.status === 'loading' || row.status === 'success' || row.status === 'skipped'}
                                                        className={`h-8 w-8 p-0 rounded-full ${row.status === 'success' || row.status === 'skipped' ? 'opacity-0' : ''}`}
                                                    >
                                                        <Save className="w-4 h-4 text-slate-600 hover:text-violet-600" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
