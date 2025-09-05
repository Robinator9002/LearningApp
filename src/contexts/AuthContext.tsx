// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';

// --- DATABASE & TYPES ---
import { db } from '../lib/db';
import type { IUser, IAppSettings } from '../types/database';

// --- CONTEXTS ---
import { useTheme } from './ThemeContext';

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

// --- CONTEXT CREATION ---
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
interface AuthProviderProps {
    children: ReactNode;
}

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
    const users = useLiveQuery(() => db.users.toArray(), [], []);

    // --- INITIALIZATION EFFECT ---
    useEffect(() => {
        const initializeAppState = async () => {
            try {
                let settings = await db.appSettings.get(1);
                // FIX: This check now correctly handles migration by looking for the new property.
                if (!settings || !settings.hasOwnProperty('defaultTheme')) {
                    const defaultSettings: IAppSettings = {
                        id: 1,
                        defaultLanguage: settings?.defaultLanguage || 'en',
                        // This was the missing piece causing the TypeScript error.
                        defaultTheme: 'light',
                        seedCoursesOnFirstRun: settings?.seedCoursesOnFirstRun ?? true,
                    };
                    await db.appSettings.put(defaultSettings);
                    settings = defaultSettings;
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
    }, []); // This effect should still only run once.

    // --- CORE AUTH FUNCTIONS ---
    const login = (user: IUser) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        // Pass the global app settings to the theme loader.
        theme.loadUserTheme(user, appSettings);

        const targetLanguage = user.language || appSettings?.defaultLanguage || 'en';
        i18n.changeLanguage(targetLanguage);
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
        // Pass the global app settings to the theme loader on logout.
        theme.loadUserTheme(null, appSettings);
        i18n.changeLanguage(appSettings?.defaultLanguage || 'en');
        navigate('/');
    };

    // --- USER CRUD OPERATIONS ---
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

    // --- GLOBAL SETTINGS MANAGEMENT ---
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
