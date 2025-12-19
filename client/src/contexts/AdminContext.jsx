import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const { addToast } = useToast();

    // Optional: Persist admin state to session storage to survive refreshes
    useEffect(() => {
        const persisted = sessionStorage.getItem('pact_admin_auth');
        if (persisted === 'true') {
            setIsAdmin(true);
        }
    }, []);

    const login = (password) => {
        if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
            setIsAdmin(true);
            sessionStorage.setItem('pact_admin_auth', 'true');
            addToast('Welcome back, Admin', 'success');
            return true;
        } else {
            addToast('Incorrect password', 'error');
            return false;
        }
    };

    const logout = () => {
        setIsAdmin(false);
        sessionStorage.removeItem('pact_admin_auth');
        addToast('Logged out successfully', 'info');
    };

    return (
        <AdminContext.Provider value={{ isAdmin, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
