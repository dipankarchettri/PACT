import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../lib/apiClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function StudentForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        usn: '',
        section: '',
        batch: new Date().getFullYear(),
        githubUsername: '',
        leetcodeUsername: '',
        hackerrankUsername: '',
        linkedinUrl: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors([]);

        try {
            const response = await studentAPI.create(formData);
            console.log('Student created:', response.data);
            navigate('/');
        } catch (error) {
            console.error('Error creating student:', error);

            if (error.response?.data?.details) {
                setErrors(error.response.data.details);
            } else if (error.response?.data?.error) {
                setErrors([error.response.data.error]);
            } else {
                setErrors(['Failed to create student. Please try again.']);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-200 rounded-full blur-[100px]"></div>
            </div>

            {/* Navbar */}
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
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </div>
            </nav>

            <motion.div
                className="max-w-2xl mx-auto px-4 pb-12 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="glass-card border-none">
                    <CardHeader>
                        <CardTitle className="text-2xl text-slate-800">Register New Student</CardTitle>
                        <CardDescription className="text-slate-500">
                            Add a student to track their coding platform performance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {errors.length > 0 && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="font-semibold text-red-800 mb-2">Validation Errors:</p>
                                <ul className="list-disc list-inside text-red-700 text-sm">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Basic Information</h3>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                        className="bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-700">
                                        USN <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        name="usn"
                                        value={formData.usn}
                                        onChange={handleChange}
                                        required
                                        placeholder="1MS21CS001"
                                        className="bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 text-slate-700">
                                            Section <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            name="section"
                                            value={formData.section}
                                            onChange={handleChange}
                                            required
                                            placeholder="A"
                                            className="bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 text-slate-700">
                                            Batch <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            name="batch"
                                            type="number"
                                            value={formData.batch}
                                            onChange={handleChange}
                                            required
                                            placeholder="2021"
                                            className="bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Platform Usernames */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-2">Platform Accounts</h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    Provide at least one platform username for tracking
                                </p>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-700">
                                        GitHub Username
                                    </label>
                                    <Input
                                        name="githubUsername"
                                        value={formData.githubUsername}
                                        onChange={handleChange}
                                        placeholder="johndoe"
                                        className="bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-700">
                                        LeetCode Username
                                    </label>
                                    <Input
                                        name="leetcodeUsername"
                                        value={formData.leetcodeUsername}
                                        onChange={handleChange}
                                        placeholder="johndoe"
                                        className="bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-slate-700">
                                        LinkedIn Profile URL
                                    </label>
                                    <Input
                                        name="linkedinUrl"
                                        type="url"
                                        value={formData.linkedinUrl}
                                        onChange={handleChange}
                                        placeholder="https://www.linkedin.com/in/johndoe"
                                        className="bg-white/50 border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-6">
                                <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 transition-opacity">
                                    {loading ? 'Creating...' : 'Register Student'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/')}
                                    disabled={loading}
                                    className="bg-white/50 border-slate-200 hover:bg-white"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
