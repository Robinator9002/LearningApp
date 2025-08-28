// src/contexts/ThemeContext.tsx
import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
    useContext,
} from 'react';

// --- Type Definitions for Theme Options ---
export type Theme = 'light' | 'dark';
export type Accent = 'blue' | 'purple' | 'green';
export type Contrast = 'normal' | 'high';
export type Font = 'sans' | 'serif' | 'mono';
export type FontSize = 0.8 | 0.9 | 1.0 | 1.1 | 1.2;

// --- State and Context Shape ---
interface ThemeState {
    theme: Theme;
    accent: Accent;
    contrast: Contrast;
    font: Font;
    fontSize: FontSize;
}

interface ThemeContextType extends ThemeState {
    setTheme: (theme: Theme) => void;
    setAccent: (accent: Accent) => void;
    setContrast: (contrast: Contrast) => void;
    setFont: (font: Font) => void;
    setFontSize: (fontSize: FontSize) => void;
}

// --- Context Creation ---
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- Helper Functions ---
const getInitialState = (): ThemeState => {
    try {
        const storedState = localStorage.getItem('themeState');
        if (storedState) {
            return JSON.parse(storedState);
        }
    } catch (error) {
        console.error('Failed to parse theme state from localStorage', error);
    }
    // Default state if nothing is stored or parsing fails
    return {
        theme: 'light',
        accent: 'blue',
        contrast: 'normal',
        font: 'sans',
        fontSize: 1.0,
    };
};

// --- Provider Component ---
interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [themeState, setThemeState] = useState<ThemeState>(getInitialState);

    // Effect to apply data attributes and save to localStorage
    useEffect(() => {
        const body = document.body;
        // Apply data attributes
        body.dataset.theme = themeState.theme;
        body.dataset.accent = themeState.accent;
        body.dataset.contrast = themeState.contrast;
        body.dataset.font = themeState.font;

        // Apply font size variable
        document.documentElement.style.setProperty(
            '--font-scale-factor',
            themeState.fontSize.toString(),
        );

        // Save to localStorage
        try {
            localStorage.setItem('themeState', JSON.stringify(themeState));
        } catch (error) {
            console.error('Failed to save theme state to localStorage', error);
        }
    }, [themeState]);

    // Memoized update functions
    const setTheme = useCallback((theme: Theme) => setThemeState((s) => ({ ...s, theme })), []);
    const setAccent = useCallback((accent: Accent) => setThemeState((s) => ({ ...s, accent })), []);
    const setContrast = useCallback(
        (contrast: Contrast) => setThemeState((s) => ({ ...s, contrast })),
        [],
    );
    const setFont = useCallback((font: Font) => setThemeState((s) => ({ ...s, font })), []);
    const setFontSize = useCallback(
        (fontSize: FontSize) => setThemeState((s) => ({ ...s, fontSize })),
        [],
    );

    const value = {
        ...themeState,
        setTheme,
        setAccent,
        setContrast,
        setFont,
        setFontSize,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// --- Custom Hook for easy consumption ---
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
