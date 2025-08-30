// src/pages/settings/tabs/AppearanceTab.tsx

import React from 'react';
import {
    useTheme,
    type Theme,
    type Accent,
    type Contrast,
    type Font,
    type FontSize,
} from '../../../contexts/ThemeContext';
import Label from '../../../components/common/Form/Label/Label';

/**
 * A reusable component for a group of theme options.
 */
const ThemeControlGroup: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
}) => (
    <div className="settings-group">
        <Label as="h3" className="settings-group__title">
            {title}
        </Label>
        <div className="settings-group__controls">{children}</div>
    </div>
);

/**
 * A reusable component for a single theme option button.
 */
const ThemeOptionButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
    className?: string;
}> = ({ onClick, isActive, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`theme-option-btn ${isActive ? 'theme-option-btn--active' : ''} ${className}`}
    >
        {children}
    </button>
);

/**
 * The AppearanceTab component provides UI controls for all theme-related settings.
 * It consumes the ThemeContext to display and update the application's appearance.
 */
const AppearanceTab: React.FC = () => {
    const {
        theme,
        setTheme,
        accent,
        setAccent,
        contrast,
        setContrast,
        font,
        setFont,
        fontSize,
        setFontSize,
    } = useTheme();

    return (
        <div className="appearance-settings">
            <ThemeControlGroup title="Color Scheme">
                <ThemeOptionButton onClick={() => setTheme('light')} isActive={theme === 'light'}>
                    Light
                </ThemeOptionButton>
                <ThemeOptionButton onClick={() => setTheme('dark')} isActive={theme === 'dark'}>
                    Dark
                </ThemeOptionButton>
            </ThemeControlGroup>

            <ThemeControlGroup title="Accent Color">
                <ThemeOptionButton
                    onClick={() => setAccent('blue')}
                    isActive={accent === 'blue'}
                    className="theme-option-btn--blue"
                />
                <ThemeOptionButton
                    onClick={() => setAccent('purple')}
                    isActive={accent === 'purple'}
                    className="theme-option-btn--purple"
                />
                <ThemeOptionButton
                    onClick={() => setAccent('green')}
                    isActive={accent === 'green'}
                    className="theme-option-btn--green"
                />
            </ThemeControlGroup>

            <ThemeControlGroup title="Contrast">
                <ThemeOptionButton
                    onClick={() => setContrast('normal')}
                    isActive={contrast === 'normal'}
                >
                    Normal
                </ThemeOptionButton>
                <ThemeOptionButton
                    onClick={() => setContrast('high')}
                    isActive={contrast === 'high'}
                >
                    High
                </ThemeOptionButton>
            </ThemeControlGroup>

            <ThemeControlGroup title="Font Style">
                <ThemeOptionButton onClick={() => setFont('sans')} isActive={font === 'sans'}>
                    Sans-Serif
                </ThemeOptionButton>
                <ThemeOptionButton onClick={() => setFont('serif')} isActive={font === 'serif'}>
                    Serif
                </ThemeOptionButton>
                <ThemeOptionButton onClick={() => setFont('mono')} isActive={font === 'mono'}>
                    Monospace
                </ThemeOptionButton>
            </ThemeControlGroup>

            <ThemeControlGroup title="Font Size">
                <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.1"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseFloat(e.target.value) as FontSize)}
                    className="font-size-slider"
                />
            </ThemeControlGroup>
        </div>
    );
};

export default AppearanceTab;
