// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import type { IUser } from '../types/database';
import { useTheme } from './ThemeContext';

// MODIFICATION: Expanded the context shape with a language update function.
interface AuthContextType {
    currentUser: IUser | null;
    login: (user: IUser) => void;
    logout: () => void;
    isLoading: boolean;
    updateCurrentUser: (user: IUser) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const theme = useTheme();
    const { i18n } = useTranslation(); // MODIFICATION: Get the i18n instance.

    useEffect(() => {
        try {
            const savedUser = sessionStorage.getItem('currentUser');
            if (savedUser) {
                const user = JSON.parse(savedUser) as IUser;
                setCurrentUser(user);
                theme.loadUserTheme(user);
                // MODIFICATION: Set language on session restore.
                if (user.language) {
                    i18n.changeLanguage(user.language);
                }
            }
        } catch (error) {
            console.error('Failed to parse user from sessionStorage', error);
        } finally {
            setIsLoading(false);
        }
    }, []); // Note: i18n is stable and doesn't need to be a dependency.

    const login = (user: IUser) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        theme.loadUserTheme(user);
        // MODIFICATION: Set language on login.
        if (user.language) {
            i18n.changeLanguage(user.language);
        }
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
        theme.loadUserTheme(null);
        // MODIFICATION: Optionally revert to browser's detected language on logout.
        i18n.changeLanguage(navigator.language.split('-')[0]);
    };

    // MODIFICATION: updateCurrentUser now also handles language changes.
    const updateCurrentUser = (user: IUser) => {
        // Only update language if it has changed to avoid unnecessary re-renders.
        if (user.language && user.language !== i18n.language) {
            i18n.changeLanguage(user.language);
        }
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    };

    const value = { currentUser, login, logout, isLoading, updateCurrentUser };

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};
