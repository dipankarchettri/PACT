import React, { useState, useRef } from 'react';
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

/**
 * Universal Badge Component
 * Handles internal PACT badges (via 'type') AND external badges (via 'name', 'icon', 'platform')
 */
export default function Badge({ type, name, icon, platform, size = 'md' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const badgeRef = useRef(null);
    
    // Config for internal badges
    const internalConfig = type ? BADGE_CONFIG[type] : null;

    // Determine styles based on platform/type
    let styles = {
        bg: 'bg-white',
        border: 'border-slate-200',
        color: 'text-slate-600',
        ring: ''
    };

    if (internalConfig) {
        styles.border = internalConfig.border;
        styles.color = internalConfig.color;
    } else if (platform === 'leetcode') {
        styles.border = 'border-orange-100';
        styles.color = 'text-orange-600';
    } else if (platform === 'github') {
        styles.border = 'border-emerald-100';
        styles.color = 'text-emerald-600';
    }

    const displayName = internalConfig ? internalConfig.label : name;
    
    // Render Icon or Image
    const renderIcon = () => {
        if (internalConfig) {
            const Icon = internalConfig.icon;
            return <Icon className="w-full h-full" />;
        }
        if (icon) {
            const imgSrc = icon.startsWith('http') ? icon : `https://leetcode.com${icon}`;
            return <img src={imgSrc} alt={displayName} className="w-full h-full object-contain rounded-full" />;
        }
        return <div className="w-full h-full bg-slate-100 rounded-full" />;
    };

    const handleMouseEnter = () => {
        if (badgeRef.current) {
            const rect = badgeRef.current.getBoundingClientRect();
            // Calculate center position above the badge
            // Basic logic: Center horizontally, Top vertically minus gap
            // We'll adjust for edges in CSS or via logic if needed, but Portal fixes clipping
            
            // Checking screen edges for simple adjustment
            let left = rect.left + rect.width / 2;
            const screenWidth = window.innerWidth;
            
            // Clamp left so tooltip doesn't overflow screen (assuming tooltip width ~256px)
            // If too close to left edge
            if (left < 130) left = 130; 
            // If too close to right edge
            if (left > screenWidth - 130) left = screenWidth - 130;

            setTooltipPos({
                top: rect.top, // We will position 'bottom' of tooltip to this 'top'
                left: left
            });
            setIsHovered(true);
        }
    };

    return (
        <>
            <motion.div 
                ref={badgeRef}
                whileHover={{ scale: 1.15, y: -2, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className={`group/badge relative w-10 h-10 md:w-12 md:h-12 p-2 bg-white rounded-full border shadow-sm cursor-pointer select-none transition-all flex items-center justify-center ${styles.border} ${styles.color}`}
                onClick={() => setIsOpen(true)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsHovered(false)}
            >
                {renderIcon()}
            </motion.div>

            {/* Portal Tooltip - Renders outside overflow containers */}
            {isHovered && createPortal(
                <AnimatePresence>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        style={{ 
                            position: 'fixed', 
                            top: tooltipPos.top - 12, // 12px gap
                            left: tooltipPos.left,
                            transform: 'translateX(-50%) translateY(-100%)' // Center horizontally, Move above top
                        }}
                        className="pointer-events-none z-[1000] origin-bottom" // origin-bottom makes scale animation grow from badge
                    >
                        <div className="bg-white text-slate-800 p-4 rounded-xl shadow-xl border border-slate-200/60 w-64 text-center relative ml-[-50%]"> 
                            {/* ml-[-50%] compensates for fixed positioning if transform override happens, but here we use style directly. 
                                Actually framer motion 'style' prop handles the translate. 
                            */}
                            
                            {/* Card Content */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center p-2 shadow-inner">
                                    {renderIcon()}
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                                        Achievement
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg leading-tight">
                                        {displayName}
                                    </h4>
                                    {platform && (
                                        <div className="text-xs text-slate-500 mt-1 capitalize">
                                            {platform}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Accent Line */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-50 rounded-b-xl"></div>
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}

            {/* Expanded Modal Details */}
            {isOpen && internalConfig && createPortal(
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
                            <div className={`p-6 text-center ${internalConfig.bg} border-b ${internalConfig.border}`}>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 p-1 rounded-full bg-white/50 hover:bg-white text-slate-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className={`mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm ${internalConfig.color}`}>
                                    {renderIcon()}
                                </div>
                                <h3 className={`text-xl font-black tracking-tight ${internalConfig.color}`}>{internalConfig.label}</h3>
                            </div>
                            <div className="p-6 text-center">
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {internalConfig.description}
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
