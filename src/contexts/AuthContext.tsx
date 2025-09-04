// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../lib/db';
import type { IUser } from '../types/database';
import { useTheme } from './ThemeContext';

// --- TYPE DEFINITIONS ---

/**
 * The full shape of the AuthContext, now including a live list of all users
 * and all necessary functions for user lifecycle management (CRUD operations).
 */
interface AuthContextType {
    currentUser: IUser | null;
    users: IUser[]; // A live-updated list of all users for admin panels.
    isLoading: boolean;
    login: (user: IUser) => void;
    logout: () => void;
    createUser: (userData: Omit<IUser, 'id'>) => Promise<void>;
    updateUser: (userId: number, updates: Partial<IUser>) => Promise<void>;
    deleteUser: (userId: number) => Promise<void>;
}

// --- CONTEXT CREATION ---
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider is the central hub for managing user authentication, session state,
 * and all user data operations. It synchronizes the user state with sessionStorage,
 * the database (via Dexie), the theme context, and the i18n instance.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // --- STATE MANAGEMENT ---
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- HOOKS & CONTEXTS ---
    const theme = useTheme();
    const { i18n } = useTranslation();
    // useLiveQuery provides a real-time, automatically updating list of all users.
    const users = useLiveQuery(() => db.users.toArray(), [], []);

    // --- EFFECTS ---
    // This effect runs once on app load to restore the user session.
    useEffect(() => {
        try {
            const savedUser = sessionStorage.getItem('currentUser');
            if (savedUser) {
                const user = JSON.parse(savedUser) as IUser;
                // Restore state for the current session
                setCurrentUser(user);
                theme.loadUserTheme(user);
                if (user.language) {
                    i18n.changeLanguage(user.language);
                }
            }
        } catch (error) {
            console.error('Failed to parse user from sessionStorage', error);
            // Clear corrupted session data if parsing fails
            sessionStorage.removeItem('currentUser');
        } finally {
            setIsLoading(false);
        }
        // This effect should only run once, hence the empty dependency array.
        // theme and i18n are stable and provided by their respective contexts.
    }, [theme, i18n]);

    // --- CORE AUTH FUNCTIONS ---

    const login = useCallback(
        (user: IUser) => {
            setCurrentUser(user);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            theme.loadUserTheme(user);
            if (user.language) {
                i18n.changeLanguage(user.language);
            }
        },
        [theme, i18n],
    );

    const logout = useCallback(() => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
        theme.loadUserTheme(null);
        // Revert to the browser's detected language on logout.
        i18n.changeLanguage(navigator.language.split('-')[0]);
    }, [theme, i18n]);

    // --- USER CRUD OPERATIONS ---

    /**
     * Creates a new user in the database.
     * @param userData - The new user's data (name, type, etc.).
     */
    const createUser = useCallback(async (userData: Omit<IUser, 'id'>) => {
        // Dexie's unique index on 'name' will automatically throw an error
        // if the name is already taken, which will be caught by the calling component.
        await db.users.add(userData as IUser);
    }, []);

    /**
     * Updates an existing user in the database and refreshes the current session if needed.
     * @param userId - The ID of the user to update.
     * @param updates - An object containing the fields to update.
     */
    const updateUser = useCallback(
        async (userId: number, updates: Partial<IUser>) => {
            await db.users.update(userId, updates);
            // If the user being updated is the one currently logged in,
            // we must refresh their session data to reflect the changes instantly.
            if (currentUser?.id === userId) {
                const updatedUser = await db.users.get(userId);
                if (updatedUser) {
                    login(updatedUser); // Use the login function to ensure all contexts are updated
                }
            }
        },
        [currentUser, login],
    );

    /**
     * Deletes a user and all their associated progress logs from the database.
     * @param userId - The ID of the user to delete.
     */
    const deleteUser = useCallback(
        async (userId: number) => {
            // It's critical to perform related deletions within a transaction
            // to ensure data integrity. If one part fails, the whole operation is rolled back.
            await db.transaction('rw', db.users, db.progressLogs, async () => {
                await db.users.delete(userId);
                await db.progressLogs.where({ userId }).delete();
            });

            // If a user deletes their own account, log them out.
            if (currentUser?.id === userId) {
                logout();
            }
        },
        [currentUser, logout],
    );

    // --- CONTEXT VALUE ---
    const value = {
        currentUser,
        users: users || [], // Provide a default empty array while Dexie initializes
        isLoading,
        login,
        logout,
        createUser,
        updateUser,
        deleteUser,
    };

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};
