import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Users, 
    Upload, 
    Plus, 
    Lock, 
    ArrowLeft, 
    LogOut,
    Shield,
    Settings
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Logo from '../components/Logo';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { isAdmin, login, logout } = useAdmin();
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        login(password);
        setPassword('');
    };

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

    // Control Card Component
    const ControlCard = ({ title, description, icon: Icon, colorClass, bgClass, onClick }) => (
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="h-full">
            <Card 
                className="glass-card cursor-pointer hover:shadow-lg transition-all h-full border-slate-200"
                onClick={onClick}
            >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full justify-center">
                    <div className={`p-4 rounded-2xl ${bgClass} shadow-inner`}>
                        <Icon className={`w-8 h-8 ${colorClass}`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{description}</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Blobs */}
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
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                                <Shield className="w-8 h-8 text-slate-700" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-slate-800">Admin Portal</CardTitle>
                            <CardDescription>Enter your credentials to access controls</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        placeholder="············"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white/50 text-center text-lg tracking-widest h-12 border-slate-200 focus:border-violet-500 focus:ring-violet-200"
                                        autoFocus
                                    />
                                </div>
                                <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200">
                                    Unlock Access
                                </Button>
                                <Button variant="ghost" type="button" onClick={() => navigate('/')} className="w-full text-slate-500 hover:text-slate-800">
                                    Back to Dashboard
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans relative flex flex-col">
             <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px]"></div>
            </div>

            <nav className="sticky top-0 z-50 glass border-b border-white/20 px-4 md:px-8 py-4 mb-8">
                <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
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
                                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Admin Portal</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800 hidden sm:flex">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={logout} 
                            className="border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white/50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <motion.div
                className="w-full max-w-6xl mx-auto px-4 md:px-8 pb-12 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Control Center
                    </h1>
                    <p className="text-slate-500 max-w-lg mx-auto">
                        Manage students, update records, and configure system settings.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ControlCard
                        title="Add New Student"
                        description="Register a single student manually"
                        icon={Plus}
                        bgClass="bg-violet-100"
                        colorClass="text-violet-600"
                        onClick={() => navigate('/add-student')}
                    />
                    <ControlCard
                        title="Manage Students"
                        description="Edit, delete, or view student details"
                        icon={Users}
                        bgClass="bg-emerald-100"
                        colorClass="text-emerald-600"
                        onClick={() => navigate('/admin/students')}
                    />
                    <ControlCard
                        title="Bulk Import"
                        description="Upload CSV to add multiple students"
                        icon={Upload}
                        bgClass="bg-orange-100"
                        colorClass="text-orange-600"
                        onClick={() => navigate('/bulk-import')}
                    />
                     <ControlCard
                        title="System Preferences"
                        description="Configure global settings (Coming Soon)"
                        icon={Settings}
                        bgClass="bg-slate-100"
                        colorClass="text-slate-600"
                        onClick={() => {}} // Placeholder
                    />
                </div>
            </motion.div>

            <div className="w-full mt-auto relative z-10 border-t border-slate-200/60 bg-white/30 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm font-medium">
                    <p>Built with passion by <span className="text-slate-600 font-bold">Khalandar</span></p>
                    <div className="flex items-center gap-4 text-xs">
                        <span>© 2025 PACT</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>Dept of AI&DS</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>v1.0.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
