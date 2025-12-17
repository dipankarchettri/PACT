import { motion } from 'framer-motion';

export default function Logo({ className = "w-8 h-8" }) {
    return (
        <motion.div
            className={`cursor-pointer ${className}`}
            initial="initial"
            whileHover="hover"
        >
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" /> {/* Violet-600 */}
                        <stop offset="100%" stopColor="#c026d3" /> {/* Fuchsia-600 */}
                    </linearGradient>
                    <linearGradient id="logoGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4c1d95" /> {/* Violet-900 */}
                        <stop offset="100%" stopColor="#701a75" /> {/* Fuchsia-900 */}
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Animated Background Shape (Abstract Hexagon/P) */}
                <motion.path
                    d="M30 20 L70 20 L90 50 L70 80 L30 80 L10 50 Z"
                    fill="url(#logoGradient)"
                    fillOpacity="0.1"
                    stroke="url(#logoGradient)"
                    strokeWidth="2"
                    variants={{
                        initial: { pathLength: 1, rotate: 0 },
                        hover: { 
                            rotate: 180,
                            transition: { duration: 0.8, ease: "easeInOut" }
                        }
                    }}
                />

                {/* Inner Dynamic Pulse */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="15"
                    fill="url(#logoGradient)"
                    variants={{
                        initial: { scale: 1, opacity: 0.5 },
                        hover: { 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                            transition: { 
                                duration: 1.5, 
                                repeat: Infinity 
                            }
                        }
                    }}
                />

                {/* Data Points / Nodes */}
                <motion.circle cx="30" cy="20" r="4" fill="#6d28d9" variants={{ initial: { scale: 1 }, hover: { scale: 1.5 } }} />
                <motion.circle cx="70" cy="80" r="4" fill="#a21caf" variants={{ initial: { scale: 1 }, hover: { scale: 1.5 } }} />
                
                {/* Connecting Line (Graph Metaphor) */}
                <motion.path
                    d="M30 20 C 40 40, 60 60, 70 80"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                    variants={{
                        initial: { pathLength: 0.8 },
                        hover: { 
                            pathLength: [0.8, 1, 0.8],
                            transition: { duration: 1.5, repeat: Infinity }
                        }
                    }}
                />
            </svg>
        </motion.div>
    );
}
