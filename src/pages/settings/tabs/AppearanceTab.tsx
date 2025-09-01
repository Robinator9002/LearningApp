// src/pages/settings/tabs/AppearanceTab.tsx

import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Label from '../../../components/common/Form/Label';
import { Sun, Palette, Contrast, Type, CaseSensitive } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface ThemeOptionButtonProps {
    onClick: () => void;
    isActive: boolean;
    children?: React.ReactNode;
    className?: string;
    'aria-label'?: string;
}

// --- SUB-COMPONENTS ---

const ThemeOptionButton: React.FC<ThemeOptionButtonProps> = ({
    onClick,
    isActive,
    children,
    className = '',
    ...props
}) => {
    const activeClass = isActive ? 'theme-option-btn--active' : '';
    const buttonClassName = `theme-option-btn ${activeClass} ${className}`.trim();
    return (
        <button className={buttonClassName} onClick={onClick} {...props}>
            {children}
        </button>
    );
};

// --- MAIN COMPONENT ---

const AppearanceTab: React.FC = () => {
    const theme = useTheme();

    if (!theme) {
        return <div>Loading theme settings...</div>;
    }

    const {
        theme: currentTheme,
        accent,
        contrast,
        font,
        fontSize,
        setTheme,
        setAccent,
        setContrast,
        setFont,
        setFontSize,
    } = theme;

    // Handler for the new slider input
    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFontSize(parseFloat(e.target.value));
    };

    return (
        <div className="appearance-settings">
            {/* --- Theme (Light/Dark) --- */}
            <div className="settings-group">
                <Label as="h4">
                    <Sun size={16} /> Theme
                </Label>
                <div className="settings-group__controls">
                    <ThemeOptionButton
                        onClick={() => setTheme('light')}
                        isActive={currentTheme === 'light'}
                    >
                        Light
                    </ThemeOptionButton>
                    <ThemeOptionButton
                        onClick={() => setTheme('dark')}
                        isActive={currentTheme === 'dark'}
                    >
                        Dark
                    </ThemeOptionButton>
                </div>
            </div>

            {/* --- Accent Color --- */}
            <div className="settings-group">
                <Label as="h4">
                    <Palette size={16} /> Accent Color
                </Label>
                <div className="settings-group__controls">
                    <ThemeOptionButton
                        onClick={() => setAccent('blue')}
                        isActive={accent === 'blue'}
                        className="theme-option-btn--accent-blue"
                        aria-label="Set accent color to blue"
                    />
                    <ThemeOptionButton
                        onClick={() => setAccent('purple')}
                        isActive={accent === 'purple'}
                        className="theme-option-btn--accent-purple"
                        aria-label="Set accent color to purple"
                    />
                    <ThemeOptionButton
                        onClick={() => setAccent('green')}
                        isActive={accent === 'green'}
                        className="theme-option-btn--accent-green"
                        aria-label="Set accent color to green"
                    />
                </div>
            </div>

            {/* --- Contrast --- */}
            <div className="settings-group">
                <Label as="h4">
                    <Contrast size={16} /> Contrast
                </Label>
                <div className="settings-group__controls">
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
                </div>
            </div>

            {/* --- Font Family --- */}
            <div className="settings-group">
                <Label as="h4">
                    <Type size={16} /> Font
                </Label>
                <div className="settings-group__controls">
                    <ThemeOptionButton onClick={() => setFont('sans')} isActive={font === 'sans'}>
                        Sans-Serif
                    </ThemeOptionButton>
                    <ThemeOptionButton onClick={() => setFont('serif')} isActive={font === 'serif'}>
                        Serif
                    </ThemeOptionButton>
                    <ThemeOptionButton onClick={() => setFont('mono')} isActive={font === 'mono'}>
                        Monospace
                    </ThemeOptionButton>
                </div>
            </div>

            {/* --- Font Size --- */}
            <div className="settings-group">
                <Label as="h4">
                    <CaseSensitive size={16} /> Font Size
                </Label>
                {/* REFACTOR: Replaced buttons with a range slider */}
                <div className="settings-group__controls font-size-control">
                    <input
                        type="range"
                        min="0.8"
                        max="1.2"
                        step="0.1"
                        value={fontSize}
                        onChange={handleFontSizeChange}
                        className="font-size-slider"
                        aria-label="Adjust font size"
                    />
                    <span className="font-size-value">{Math.round(fontSize * 100)}%</span>
                </div>
            </div>
        </div>
    );
};

export default AppearanceTab;
