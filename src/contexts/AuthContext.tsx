// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import type { IUser } from '../types/database';

// Define the shape of the context data
interface AuthContextType {
    currentUser: IUser | null;
    login: (user: IUser) => void;
    logout: () => void;
    isLoading: boolean;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * The AuthProvider component manages the current user's state,
 * including persistence to sessionStorage.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On initial load, check sessionStorage for a saved user session
    useEffect(() => {
        try {
            const savedUser = sessionStorage.getItem('currentUser');
            if (savedUser) {
                setCurrentUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('Failed to parse user from sessionStorage', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Login function: sets the current user and saves to sessionStorage
    const login = (user: IUser) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    };

    // Logout function: clears the user and removes from sessionStorage
    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
    };

    const value = { currentUser, login, logout, isLoading };

    // We don't render children until we've checked sessionStorage
    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};
