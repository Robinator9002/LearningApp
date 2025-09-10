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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { i18n } = useTranslation();

    const [currentUser, setCurrentUser] = useState<IUser | null>(null);
    const [appSettings, setAppSettings] = useState<IAppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const users = useLiveQuery(() => db.users.toArray(), [], []);

    useEffect(() => {
        const initializeAppState = async () => {
            try {
                // This logic remains to ensure settings are created if they don't exist.
                // The ThemeProvider will also fetch them, but this guarantees their existence.
                let settings = await db.appSettings.get(1);
                if (!settings) {
                    const defaultSettings: IAppSettings = {
                        id: 1,
                        defaultLanguage: i18n.language.startsWith('de') ? 'de' : 'en',
                        seedCoursesOnFirstRun: true,
                        defaultTheme: 'light',
                        starterCoursesImported: false,
                    };
                    await db.appSettings.put(defaultSettings);
                    settings = defaultSettings;
                }
                setAppSettings(settings || null);

                const savedUserJson = sessionStorage.getItem('currentUser');
                if (savedUserJson) {
                    const savedUser = JSON.parse(savedUserJson) as IUser;
                    const userInDb = await db.users.get(savedUser.id!);
                    if (userInDb) {
                        login(userInDb);
                    } else {
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
    }, [i18n]); // Dependency is fine here.

    // REFACTORED: The login function is now much cleaner.
    const login = (user: IUser) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        // It no longer fetches settings; it just tells the ThemeContext about the user.
        theme.loadUserTheme(user);
        const targetLanguage = user.language || appSettings?.defaultLanguage || 'en';
        i18n.changeLanguage(targetLanguage);
    };

    // REFACTORED: The logout function is also cleaner.
    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
        // Tells the ThemeContext to revert to the default theme.
        theme.loadUserTheme(null);
        i18n.changeLanguage(appSettings?.defaultLanguage || 'en');
        navigate('/');
    };

    const createUser = async (userData: Omit<IUser, 'id'>) => {
        await db.users.add(userData as IUser);
    };

    const updateUser = async (userId: number, updates: Partial<IUser>) => {
        await db.users.update(userId, updates);
        if (currentUser?.id === userId) {
            const updatedCurrentUser = await db.users.get(userId);
            if (updatedCurrentUser) {
                // Re-login to apply any potential settings changes.
                login(updatedCurrentUser);
            }
        }
    };

    const deleteUser = async (userId: number) => {
        await db.transaction('rw', db.users, db.progressLogs, db.userTracking, async () => {
            await db.users.delete(userId);
            await db.progressLogs.where({ userId }).delete();
            await db.userTracking.where({ userId }).delete();
        });

        if (currentUser?.id === userId) {
            logout();
        }
    };

    const updateAppSettings = async (updates: Partial<IAppSettings>) => {
        await db.appSettings.update(1, updates);
        const newSettings = await db.appSettings.get(1);
        setAppSettings(newSettings || null);
        // If no user is logged in, immediately apply the new default theme.
        if (!currentUser) {
            theme.loadUserTheme(null);
        }
    };

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
