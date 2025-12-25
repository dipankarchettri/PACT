import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { Button } from './ui/Button';

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/20 px-4 md:px-8 py-4 mb-8 bg-white/60 backdrop-blur-md">
            <div className="w-full px-2 md:px-6 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
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
                </div>

                <div className="relative">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin')}
                        className="rounded-full border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 bg-white/50 h-8 px-3 text-xs md:h-10 md:px-4 md:text-sm"
                    >
                        Admin Dashboard
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
