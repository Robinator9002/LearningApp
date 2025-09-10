// src/contexts/ThemeContext.tsx

import React, {
    createContext,
    useState,
    useEffect,
    type ReactNode,
    useCallback,
    useContext,
} from 'react';
import { db } from '../lib/db.ts';
import type { IUser, IThemeState, IAppSettings } from '../types/database';

// --- Type Definitions ---
export type { IThemeState };
export type Theme = IThemeState['theme'];
export type Accent = IThemeState['accent'];
export type Contrast = IThemeState['contrast'];
export type Font = IThemeState['font'];
export type FontSize = IThemeState['fontSize'];

// --- Context Shape ---
interface ThemeContextType extends IThemeState {
    // REFACTORED: Simplified to only take a user object.
    loadUserTheme: (user: IUser | null) => void;
    setTheme: (theme: Theme) => void;
    setAccent: (accent: Accent) => void;
    setContrast: (contrast: Contrast) => void;
    setFont: (font: Font) => void;
    setFontSize: (fontSize: FontSize) => void;
}

// --- Context Creation ---
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- Default State ---
const defaultThemeState: IThemeState = {
    theme: 'light',
    accent: 'blue',
    contrast: 'normal',
    font: 'sans',
    fontSize: 1.0,
};

// --- Provider Component ---
interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [themeState, setThemeState] = useState<IThemeState>(defaultThemeState);
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);
    // NEW: State to hold the global app settings.
    const [globalSettings, setGlobalSettings] = useState<IAppSettings | null>(null);

    // NEW EFFECT: This effect runs ONCE when the app starts.
    // Its sole job is to fetch the global settings and apply the default theme.
    useEffect(() => {
        const fetchGlobalSettings = async () => {
            try {
                const settings = await db.appSettings.get(1);
                if (settings) {
                    setGlobalSettings(settings);
                    // Apply the default global theme immediately.
                    const newDefaultState = {
                        ...defaultThemeState,
                        theme: settings.defaultTheme || 'light',
                    };
                    setThemeState(newDefaultState);
                }
            } catch (error) {
                console.error('Failed to load global app settings:', error);
            }
        };
        fetchGlobalSettings();
    }, []);

    // This effect applies the current themeState to the document body.
    useEffect(() => {
        const body = document.body;
        body.dataset.theme = themeState.theme;
        body.dataset.accent = themeState.accent;
        body.dataset.contrast = themeState.contrast;
        body.dataset.font = themeState.font;
        document.documentElement.style.setProperty(
            '--font-scale-factor',
            themeState.fontSize.toString(),
        );
    }, [themeState]);

    // REFACTORED: This function is now much simpler.
    // It decides whether to apply a user's theme or revert to the global default.
    const loadUserTheme = useCallback(
        (user: IUser | null) => {
            setCurrentUser(user);
            if (user && user.settings) {
                // If a user with settings logs in, apply their theme.
                setThemeState(user.settings);
            } else if (globalSettings) {
                // If no user, or user has no settings, revert to the global default theme.
                const newDefaultState = {
                    ...defaultThemeState,
                    theme: globalSettings.defaultTheme || 'light',
                };
                setThemeState(newDefaultState);
            }
        },
        [globalSettings], // Depends on globalSettings being loaded.
    );

    const updateThemeSetting = useCallback(
        (newSettings: Partial<IThemeState>) => {
            if (!currentUser || !currentUser.id) return;

            const updatedState = { ...themeState, ...newSettings };
            setThemeState(updatedState);

            db.users.update(currentUser.id, {
                settings: updatedState,
            });
        },
        [currentUser, themeState],
    );

    const setTheme = useCallback(
        (theme: Theme) => updateThemeSetting({ theme }),
        [updateThemeSetting],
    );
    const setAccent = useCallback(
        (accent: Accent) => updateThemeSetting({ accent }),
        [updateThemeSetting],
    );
    const setContrast = useCallback(
        (contrast: Contrast) => updateThemeSetting({ contrast }),
        [updateThemeSetting],
    );
    const setFont = useCallback((font: Font) => updateThemeSetting({ font }), [updateThemeSetting]);
    const setFontSize = useCallback(
        (fontSize: FontSize) => updateThemeSetting({ fontSize }),
        [updateThemeSetting],
    );

    const value = {
        ...themeState,
        loadUserTheme,
        setTheme,
        setAccent,
        setContrast,
        setFont,
        setFontSize,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// --- Custom Hook ---
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
