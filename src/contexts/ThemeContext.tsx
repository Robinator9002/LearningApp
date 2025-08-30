// src/contexts/ThemeContext.tsx

import React, {
    createContext,
    useState,
    useEffect,
    type ReactNode,
    useCallback,
    useContext,
} from 'react';
import { db } from '../lib/db';
import type { IUser, IThemeState } from '../types/database';

// --- Type Definitions ---
// Re-exporting these types for easy access from other components
export type { IThemeState };
export type Theme = IThemeState['theme'];
export type Accent = IThemeState['accent'];
export type Contrast = IThemeState['contrast'];
export type Font = IThemeState['font'];
export type FontSize = IThemeState['fontSize'];

// --- Context Shape ---
interface ThemeContextType extends IThemeState {
    // This new function will be called by AuthContext on login/logout
    loadUserTheme: (user: IUser | null) => void;
    // Setter functions remain, but their internal logic will change
    setTheme: (theme: Theme) => void;
    setAccent: (accent: Accent) => void;
    setContrast: (contrast: Contrast) => void;
    setFont: (font: Font) => void;
    setFontSize: (fontSize: FontSize) => void;
}

// --- Context Creation ---
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- Default State ---
/**
 * The default theme state for new users or users who haven't set their preferences.
 * This ensures a consistent starting point.
 */
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

    // --- Core Logic ---

    // 1. This effect applies the current theme state to the DOM whenever it changes.
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

    // 2. This function is the new entry point, called by AuthContext.
    const loadUserTheme = useCallback((user: IUser | null) => {
        setCurrentUser(user); // Keep track of the current user
        if (user && user.settings) {
            // If the user exists and has settings, apply them
            setThemeState(user.settings);
        } else {
            // Otherwise, revert to the default theme (e.g., on logout)
            setThemeState(defaultThemeState);
        }
    }, []);

    // 3. The generic update function that handles saving changes to the database.
    const updateThemeSetting = useCallback(
        (newSettings: Partial<IThemeState>) => {
            if (!currentUser || !currentUser.id) return; // Safety check

            const updatedState = { ...themeState, ...newSettings };
            setThemeState(updatedState); // Update the UI immediately

            // Asynchronously update the database
            db.users.update(currentUser.id, {
                settings: updatedState,
            });
        },
        [currentUser, themeState],
    );

    // --- Memoized Setter Functions ---
    // Each setter now calls the generic update function.
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
