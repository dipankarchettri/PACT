import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ id, message, type = 'info', duration = 3000, onClose }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    const variants = {
        initial: { opacity: 0, x: 50, scale: 0.9 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    const styles = {
        success: {
            icon: CheckCircle,
            bg: 'bg-emerald-50/90',
            border: 'border-emerald-200',
            text: 'text-emerald-800',
            iconColor: 'text-emerald-600'
        },
        error: {
            icon: AlertCircle,
            bg: 'bg-red-50/90',
            border: 'border-red-200',
            text: 'text-red-800',
            iconColor: 'text-red-600'
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-amber-50/90',
            border: 'border-amber-200',
            text: 'text-amber-800',
            iconColor: 'text-amber-600'
        },
        info: {
            icon: Info,
            bg: 'bg-slate-50/90',
            border: 'border-slate-200',
            text: 'text-slate-800',
            iconColor: 'text-slate-600'
        }
    };

    const style = styles[type] || styles.info;
    const Icon = style.icon;

    return (
        <motion.div
            layout
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md min-w-[300px] max-w-sm ${style.bg} ${style.border}`}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${style.iconColor}`} />
            <p className={`text-sm font-medium flex-1 ${style.text}`}>{message}</p>
            <button
                onClick={() => onClose(id)}
                className={`p-1 rounded-full hover:bg-black/5 transition-colors ${style.iconColor}`}
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export default Toast;
