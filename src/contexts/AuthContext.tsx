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
                let settings = await db.appSettings.get(1);
                if (!settings) {
                    const defaultSettings: IAppSettings = {
                        id: 1,
                        defaultLanguage: i18n.language.startsWith('de') ? 'de' : 'en',
                        seedCoursesOnFirstRun: true,
                        defaultTheme: 'light',
                        // NEW: Initialize the new flag on first run.
                        starterCoursesImported: false,
                    };
                    await db.appSettings.put(defaultSettings);
                    settings = defaultSettings;
                }

                // NEW: This logic handles migration for existing users. If the settings
                // object exists but is missing our new flag, we update the database
                // to include it with a default 'false' value.
                if (settings && typeof settings.starterCoursesImported === 'undefined') {
                    await db.appSettings.update(1, { starterCoursesImported: false });
                    // Reload settings from the DB to ensure our state is current.
                    settings = await db.appSettings.get(1);
                }

                setAppSettings(settings);

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
    }, [i18n]);

    const login = (user: IUser) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        theme.loadUserTheme(user, appSettings);

        const targetLanguage = user.language || appSettings?.defaultLanguage || 'en';
        i18n.changeLanguage(targetLanguage);
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
        theme.loadUserTheme(null, appSettings);
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
                login(updatedCurrentUser);
            }
        }
    };

    const deleteUser = async (userId: number) => {
        await db.transaction('rw', db.users, db.progressLogs, async () => {
            await db.users.delete(userId);
            await db.progressLogs.where({ userId }).delete();
        });

        if (currentUser?.id === userId) {
            logout();
        }
    };

    const updateAppSettings = async (updates: Partial<IAppSettings>) => {
        await db.appSettings.update(1, updates);
        const newSettings = await db.appSettings.get(1);
        if (newSettings) {
            setAppSettings(newSettings);
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
