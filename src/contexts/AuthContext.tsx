// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';

// --- DATABASE & TYPES ---
import { db } from '../lib/db.ts';
import type { IUser, IAppSettings } from '../types/database.ts';

// --- CONTEXTS ---
import { useTheme } from './ThemeContext.tsx';

// --- TYPE DEFINITIONS ---
// The shape of the data and functions the context will provide to the app.
export interface AuthContextType {
    currentUser: IUser | null;
    users: IUser[];
    appSettings: IAppSettings | null;
    isLoading: boolean;
    login: (user: IUser) => void;
    logout: () => void;
    createUser: (userData: Omit<IUser, 'id'>) => Promise<void>;
    updateUser: (userId: number, updates: Partial<IUser>) => Promise<void>;
    deleteUser: (userId: number) => Promise<void>;
    updateAppSettings: (updates: Partial<IAppSettings>) => Promise<void>;
}

// --- CONTEXT CREATION ---
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider is the master component for managing all authentication,
 * user data, and global application settings. It serves as the single
- * source of truth for "who" is using the app and "how" the app should behave globally.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // --- HOOKS ---
    const navigate = useNavigate();
    const theme = useTheme();
    const { i18n } = useTranslation();

    // --- STATE MANAGEMENT ---
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);
    const [appSettings, setAppSettings] = useState<IAppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- LIVE DATA QUERIES ---
    // This hook keeps the 'users' array in sync with the database in real-time.
    const users = useLiveQuery(() => db.users.toArray(), [], []);

    // --- INITIALIZATION EFFECT ---
    // This crucial effect runs once on app startup. It initializes settings,
    // restores sessions, and ensures the app is in a valid state.
    useEffect(() => {
        const initializeAppState = async () => {
            try {
                // 1. Ensure global settings exist.
                let settings = await db.appSettings.get(1);
                if (!settings) {
                    // If no settings are found, this is a first run. Create defaults.
                    const defaultSettings: IAppSettings = {
                        id: 1,
                        defaultLanguage: i18n.language.startsWith('de') ? 'de' : 'en',
                        // FIX: Corrected property name to align with the IAppSettings interface.
                        seedCoursesOnFirstRun: true,
                    };
                    await db.appSettings.add(defaultSettings);
                    settings = defaultSettings;
                }
                setAppSettings(settings);

                // 2. Attempt to restore a logged-in session.
                const savedUserJson = sessionStorage.getItem('currentUser');
                if (savedUserJson) {
                    const savedUser = JSON.parse(savedUserJson) as IUser;
                    // Verify the user still exists in the database.
                    const userInDb = await db.users.get(savedUser.id!);
                    if (userInDb) {
                        login(userInDb); // Use the login function to ensure all state is set correctly.
                    } else {
                        // The user was deleted elsewhere; clear the session.
                        sessionStorage.removeItem('currentUser');
                    }
                }
            } catch (error) {
                console.error('Failed to initialize application state:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAppState();
    }, []); // Empty dependency array ensures this runs only once.

    // --- CORE AUTH FUNCTIONS ---

    /**
     * Logs a user in, sets all relevant state, and persists the session.
     * @param user - The full user object from the database.
     */
    const login = (user: IUser) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        theme.loadUserTheme(user);

        // Apply language preference: user's setting -> app default -> fallback 'en'
        const targetLanguage = user.language || appSettings?.defaultLanguage || 'en';
        i18n.changeLanguage(targetLanguage);
    };

    /**
     * Logs the current user out, clears the session, and resets contexts.
     */
    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
        theme.loadUserTheme(null);
        // Revert to the application's default language on logout.
        i18n.changeLanguage(appSettings?.defaultLanguage || 'en');
        navigate('/');
    };

    // --- USER CRUD OPERATIONS ---

    /**
     * Creates a new user in the database.
     * @param userData - The data for the new user.
     */
    const createUser = async (userData: Omit<IUser, 'id'>) => {
        // Dexie's unique index on 'name' will automatically throw an error
        // if the name is already taken, which we catch in the component.
        await db.users.add(userData as IUser);
    };

    /**
     * Updates an existing user's data in the database and in the context state.
     * @param userId - The ID of the user to update.
     * @param updates - An object containing the fields to update.
     */
    const updateUser = async (userId: number, updates: Partial<IUser>) => {
        await db.users.update(userId, updates);

        // If the updated user is the currently logged-in user, refresh their context state.
        if (currentUser?.id === userId) {
            const updatedCurrentUser = await db.users.get(userId);
            if (updatedCurrentUser) {
                login(updatedCurrentUser); // Re-run login to apply all changes (like language)
            }
        }
    };

    /**
     * Deletes a user and all their associated progress logs from the database.
     * @param userId - The ID of the user to delete.
     */
    const deleteUser = async (userId: number) => {
        // Use a transaction to ensure both operations succeed or fail together.
        await db.transaction('rw', db.users, db.progressLogs, async () => {
            await db.users.delete(userId);
            await db.progressLogs.where({ userId }).delete();
        });

        // If the user deleted themselves, log them out.
        if (currentUser?.id === userId) {
            logout();
        }
    };

    // --- GLOBAL SETTINGS MANAGEMENT ---

    /**
     * Updates the global application settings.
     * @param updates - An object containing the settings to change.
     */
    const updateAppSettings = async (updates: Partial<IAppSettings>) => {
        await db.appSettings.update(1, updates);
        const newSettings = await db.appSettings.get(1);
        if (newSettings) {
            setAppSettings(newSettings);
        }
    };

    // --- CONTEXT VALUE ---
    // Memoization isn't strictly necessary here due to the provider's structure,
    // but it's good practice. The value is what consumers of the context will receive.
    const value: AuthContextType = {
        currentUser,
        users: users || [],
        appSettings,
        isLoading,
        login,
        logout,
        createUser,
        updateUser,
        deleteUser,
        updateAppSettings,
    };

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};
