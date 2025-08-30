// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import type { IUser } from '../types/database';
import { useTheme } from './ThemeContext'; // Import the useTheme hook

// Define the shape of the context data
interface AuthContextType {
    currentUser: IUser | null;
    login: (user: IUser) => void;
    logout: () => void;
    isLoading: boolean;
    updateCurrentUser: (user: IUser) => void; // Add a function to update user data
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * The AuthProvider component manages the current user's state,
 * including persistence to sessionStorage and theme loading.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const theme = useTheme(); // Get the theme context

    // On initial load, check sessionStorage for a saved user session
    useEffect(() => {
        try {
            const savedUser = sessionStorage.getItem('currentUser');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                setCurrentUser(user);
                // CRITICAL: Load the theme for the session-restored user
                theme.loadUserTheme(user);
            }
        } catch (error) {
            console.error('Failed to parse user from sessionStorage', error);
        } finally {
            setIsLoading(false);
        }
    }, []); // This effect should only run once

    // Login function: now also loads the user's theme
    const login = (user: IUser) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        // CRITICAL: Load the theme for the newly logged-in user
        theme.loadUserTheme(user);
    };

    // Logout function: now also reverts to the default theme
    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
        // CRITICAL: Revert to the default theme on logout
        theme.loadUserTheme(null);
    };

    // New function to keep the currentUser in sync after a database update (e.g., name change)
    const updateCurrentUser = (user: IUser) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    };

    const value = { currentUser, login, logout, isLoading, updateCurrentUser };

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};
