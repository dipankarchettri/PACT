import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Medal, Flame, GitMerge, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BADGE_CONFIG = {
    'Top Solver': {
        icon: Medal,
        color: 'text-amber-600',
        bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
        border: 'border-amber-200',
        label: 'Top Solver',
        description: 'Awarded for solving 100+ LeetCode problems.'
    },
    'Problem Solver': {
        icon: Medal,
        color: 'text-blue-600',
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-200',
        label: 'Problem Solver',
        description: 'Awarded for solving 50+ LeetCode problems.'
    },
    'Streak Master': {
        icon: Flame,
        color: 'text-orange-600',
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-200',
        label: 'Streak Master',
        description: 'Maintained a coding streak of 30+ days on LeetCode or GitHub.'
    },
    'Open Source Hero': {
        icon: GitMerge,
        color: 'text-purple-600',
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        border: 'border-purple-200',
        label: 'Open Source Hero',
        description: 'Made 500+ significant contributions to Open Source on GitHub.'
    },
    'Open Source Enthusiast': {
        icon: GitMerge,
        color: 'text-teal-600',
        bg: 'bg-gradient-to-br from-teal-50 to-teal-100',
        border: 'border-teal-200',
        label: 'Open Source Enthusiast',
        description: 'Made 300+ contributions to Open Source on GitHub.'
    }
};

export default function Badge({ type, size = 'md' }) {
    const [isOpen, setIsOpen] = useState(false);
    const config = BADGE_CONFIG[type];

    if (!config) return null;

    const Icon = config.icon;
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1.5 text-xs';
    const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

    return (
        <>
            <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-1.5 rounded-full border font-bold shadow-sm cursor-pointer select-none transition-all hover:shadow-md ${config.bg} ${config.border} ${config.color} ${sizeClasses}`}
                onClick={() => setIsOpen(true)}
            >
                <Icon className={iconSize} />
                <span>{config.label}</span>
            </motion.div>

            {isOpen && createPortal(
                <AnimatePresence>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 grid-backdrop backdrop-blur-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden z-[10000]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`p-6 text-center ${config.bg} border-b ${config.border}`}>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 p-1 rounded-full bg-white/50 hover:bg-white text-slate-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className={`mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm ${config.color}`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <h3 className={`text-xl font-black tracking-tight ${config.color}`}>{config.label}</h3>
                            </div>
                            <div className="p-6 text-center">
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {config.description}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
