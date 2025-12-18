import { motion } from 'framer-motion';
import Logo from './Logo';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md">
            <div className="relative">
                {/* Pulsing rings */}
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-violet-200 blur-xl"
                />
                
                {/* Logo container */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 bg-white p-4 rounded-3xl shadow-xl border border-white/50"
                >
                    <Logo className="w-16 h-16 animate-pulse" />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-center"
            >
                <div className="text-xl font-bold text-slate-800 tracking-tight mb-2">PACT</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1 justify-center">
                    Cooking Data
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.1 }}
                    >.</motion.span>
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, repeatDelay: 0.1 }}
                    >.</motion.span>
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, repeatDelay: 0.1 }}
                    >.</motion.span>
                </div>
            </motion.div>
        </div>
    );
}
