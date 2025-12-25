import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Save, ArrowLeft, Github, Code2, Linkedin, Phone, CheckCircle, Loader2, Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { studentAPI } from '../lib/apiClient';
import Logo from '../components/Logo';
import { useToast } from '../contexts/ToastContext';

export default function StudentSelfUpdate() {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();

    // Auto-select student if passed via navigation state
    useEffect(() => {
        if (location.state?.student) {
            handleSelectStudent(location.state.student);
            // Clear state to prevent re-selection on refresh (optional, but good practice)
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // State for form
    const [formData, setFormData] = useState({
        githubUsername: '',
        leetcodeUsername: '',
        linkedinUrl: '',
        phoneNumber: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const [otp, setOtp] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [verifiedOtp, setVerifiedOtp] = useState(true); // Bypass OTP verification for now

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setIsSearching(true);
                try {
                    const { data } = await studentAPI.getAll({ search: searchTerm });
                    setSearchResults(data);
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setFormData({
            githubUsername: student.githubUsername || '',
            leetcodeUsername: student.leetcodeUsername || '',
            linkedinUrl: student.linkedinUrl || '',
            phoneNumber: student.phoneNumber || ''
        });
        setSearchTerm('');
        setSearchResults([]);
        // Reset OTP state for new selection
        setOtp('');
        setOtpSent(false);
        setVerifiedOtp(true); // Keep verified true
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSendOTP = async () => {
        if (!selectedStudent) return;
        setIsSendingOtp(true);
        try {
            const res = await fetch(`/api/students/${selectedStudent._id}/send-otp`, { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                addToast(data.message, "success");
                setOtpSent(true);
            } else {
                addToast(data.error || "Failed to send OTP", "error");
            }
        } catch (error) {
            console.error("OTP Error:", error);
            addToast("Network error. Try again.", "error");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent || !verifiedOtp) return; // double check

        setIsSaving(true);
        try {
            // Include OTP in the payload
            await studentAPI.update(selectedStudent._id, {
                ...selectedStudent,
                ...formData,
                otp // Send OTP for server-side verification
            });
            
            addToast("Profile updated successfully!", "success");
            
            // Short delay before redirecting back to dashboard
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (error) {
            console.error("Update failed:", error);
            addToast(error.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden">
            {/* Background blobs */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-100 rounded-full blur-[100px]"></div>
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
                            <span className="text-2xl font-black tracking-tight text-slate-900">PACT</span>
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Performance Analytics</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800">
                        <ArrowLeft className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Back to Dashboard</span>
                    </Button>
                </div>
            </nav>

            <div className="max-w-xl mx-auto px-4 pb-20 relative z-10 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {!selectedStudent ? (
                        <Card className="glass-card border-slate-200/60 shadow-xl">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                    <User className="w-6 h-6 text-violet-600" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-slate-800">Find Your Profile</CardTitle>
                                <p className="text-slate-500 text-sm">Search for your name to update your information</p>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <Input
                                        className="pl-12 h-12 text-lg bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-violet-100 focus:border-violet-300 rounded-xl"
                                        placeholder="Start typing your name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                    {isSearching && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {/* Results List */}
                                <div className="mt-4 space-y-2">
                                    <AnimatePresence>
                                        {searchResults.map((student) => (
                                            <motion.div
                                                key={student._id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                onClick={() => handleSelectStudent(student)}
                                                className="p-3 rounded-lg border border-slate-100 bg-white hover:bg-violet-50 hover:border-violet-100 cursor-pointer transition-all flex items-center justify-between group"
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-800 group-hover:text-violet-700">{student.name}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{student.usn}</p>
                                                </div>
                                                <div className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600 group-hover:bg-white">
                                                    Batch {student.batch}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    
                                    {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                                        <div className="text-center py-8 text-slate-400">
                                            <p>No students found matching "{searchTerm}"</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="glass-card border-slate-200/60 shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                                    <Code2 className="w-32 h-32" />
                                </div>
                                <h2 className="text-2xl font-bold relative z-10">{selectedStudent.name}</h2>
                                <p className="opacity-80 font-mono text-sm relative z-10">{selectedStudent.usn} • {selectedStudent.section} Sec</p>
                                <button 
                                    onClick={() => setSelectedStudent(null)}
                                    className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white text-xs flex items-center gap-1 backdrop-blur-sm z-20"
                                >
                                    <ArrowLeft className="w-3 h-3" /> Change
                                </button>
                            </div>
                            
                            <CardContent className="p-6">
                                {/* Step 1: Request OTP */}
                                {!verifiedOtp ? (
                                    <div className="space-y-6 text-center py-8">
                                        <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                            <div className="text-2xl">🔒</div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">Identity Verification Required</h3>
                                        <p className="text-slate-500 max-w-sm mx-auto">
                                            To ensure security, please verify your identity before making changes. We will send a One-Time Password (OTP) to your registered email.
                                        </p>

                                        {!otpSent ? (
                                            <Button 
                                                onClick={handleSendOTP} 
                                                disabled={isSendingOtp}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full max-w-xs"
                                            >
                                                {isSendingOtp ? (
                                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                                                ) : (
                                                    'Send OTP via Email'
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="space-y-4 max-w-xs mx-auto animate-in fade-in slide-in-from-bottom-4">
                                                <div className="flex flex-col items-center gap-2">
                                                    <label className="text-sm font-medium text-slate-700">Enter Verification Code</label>
                                                    <Input 
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        placeholder="Enter 6-digit OTP"
                                                        className="text-center text-2xl tracking-widest h-14"
                                                        maxLength={6}
                                                    />
                                                </div>
                                                <Button 
                                                    onClick={() => {
                                                        if (otp.length === 6) {
                                                            setVerifiedOtp(true);
                                                            addToast("Identity verified! You can now edit your profile.", "success");
                                                        } else {
                                                            addToast("Please enter a valid 6-digit OTP", "error");
                                                        }
                                                    }}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    Verify & Proceed
                                                </Button>
                                                <button 
                                                    onClick={() => setOtpSent(false)}
                                                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                                                >
                                                    Resend Code
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Step 2: Edit Form (Only shown after verification) */
                                    <>
                                        {/* Avatar Upload Section */}
                                        <div className="flex flex-col items-center mb-6">
                                            <div 
                                                className="relative w-24 h-24 rounded-full border-4 border-white shadow-md cursor-pointer group bg-slate-100 overflow-hidden"
                                                onClick={() => document.getElementById('update-avatar-upload').click()}
                                            >
                                                <img
                                                    src={selectedStudent.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${selectedStudent.name}&backgroundColor=e2e8f0`}
                                                    alt={selectedStudent.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Camera className="w-8 h-8 text-white" />
                                                </div>
                                                <input 
                                                    type="file" 
                                                    id="update-avatar-upload" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;

                                                        if (file.size > 5 * 1024 * 1024) {
                                                            addToast('File size must be less than 5MB', 'error');
                                                            return;
                                                        }

                                                        const formData = new FormData();
                                                        formData.append('avatar', file);

                                                        try {
                                                            addToast('Uploading image...', 'info');
                                                            const res = await fetch(`/api/students/${selectedStudent._id}/avatar`, {
                                                                method: 'POST',
                                                                body: formData
                                                            });
                                                            
                                                            if (!res.ok) throw new Error('Upload failed');
                                                            
                                                            const data = await res.json();
                                                            setSelectedStudent(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
                                                            addToast('Profile picture updated!', 'success');
                                                        } catch (err) {
                                                            console.error('Upload failed:', err);
                                                            addToast('Failed to upload image', 'error');
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">Click to change photo</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                                                        <Github className="w-4 h-4 text-slate-600" /> GitHub Username
                                                    </label>
                                                    <Input
                                                        name="githubUsername"
                                                        value={formData.githubUsername}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. mona-lisa"
                                                        className="bg-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                                                        <Code2 className="w-4 h-4 text-slate-600" /> LeetCode Username
                                                    </label>
                                                    <Input
                                                        name="leetcodeUsername"
                                                        value={formData.leetcodeUsername}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. monalisa"
                                                        className="bg-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                                                        <Linkedin className="w-4 h-4 text-slate-600" /> LinkedIn URL
                                                    </label>
                                                    <Input
                                                        name="linkedinUrl"
                                                        value={formData.linkedinUrl}
                                                        onChange={handleInputChange}
                                                        placeholder="https://linkedin.com/in/..."
                                                        className="bg-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                                                        <Phone className="w-4 h-4 text-slate-600" /> Phone Number <span className="text-xs font-normal text-slate-400">(Optional)</span>
                                                    </label>
                                                    <Input
                                                        name="phoneNumber"
                                                        value={formData.phoneNumber}
                                                        onChange={handleInputChange}
                                                        placeholder="+91..."
                                                        className="bg-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <Button 
                                                    type="submit" 
                                                    disabled={isSaving}
                                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-base shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Update Profile
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            
                                            <p className="text-xs text-center text-slate-400 mt-4">
                                                Data is validated automatically. Invalid usernames may result in stats not tracking.
                                            </p>
                                        </form>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
