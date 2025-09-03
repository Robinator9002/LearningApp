// src/pages/settings/tabs/AppearanceTab.tsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
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
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation
    const theme = useTheme();

    if (!theme) {
        return <div>{t('loading.theme')}</div>; // MODIFICATION: Translated loading text
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

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFontSize(parseFloat(e.target.value));
    };

    return (
        <div className="appearance-settings">
            {/* --- Theme (Light/Dark) --- */}
            <div className="settings-group">
                <Label as="h4">
                    <Sun size={16} /> {t('settings.appearance.theme')}
                </Label>
                <div className="settings-group__controls">
                    <ThemeOptionButton
                        onClick={() => setTheme('light')}
                        isActive={currentTheme === 'light'}
                    >
                        {t('settings.appearance.light')}
                    </ThemeOptionButton>
                    <ThemeOptionButton
                        onClick={() => setTheme('dark')}
                        isActive={currentTheme === 'dark'}
                    >
                        {t('settings.appearance.dark')}
                    </ThemeOptionButton>
                </div>
            </div>

            {/* --- Accent Color --- */}
            <div className="settings-group">
                <Label as="h4">
                    <Palette size={16} /> {t('settings.appearance.accent')}
                </Label>
                <div className="settings-group__controls">
                    <ThemeOptionButton
                        onClick={() => setAccent('blue')}
                        isActive={accent === 'blue'}
                        className="theme-option-btn--accent-blue"
                        aria-label={t('settings.appearance.setAccent', { color: 'blue' })}
                    />
                    <ThemeOptionButton
                        onClick={() => setAccent('purple')}
                        isActive={accent === 'purple'}
                        className="theme-option-btn--accent-purple"
                        aria-label={t('settings.appearance.setAccent', { color: 'purple' })}
                    />
                    <ThemeOptionButton
                        onClick={() => setAccent('green')}
                        isActive={accent === 'green'}
                        className="theme-option-btn--accent-green"
                        aria-label={t('settings.appearance.setAccent', { color: 'green' })}
                    />
                </div>
            </div>

            {/* --- Contrast --- */}
            <div className="settings-group">
                <Label as="h4">
                    <Contrast size={16} /> {t('settings.appearance.contrast')}
                </Label>
                <div className="settings-group__controls">
                    <ThemeOptionButton
                        onClick={() => setContrast('normal')}
                        isActive={contrast === 'normal'}
                    >
                        {t('settings.appearance.normal')}
                    </ThemeOptionButton>
                    <ThemeOptionButton
                        onClick={() => setContrast('high')}
                        isActive={contrast === 'high'}
                    >
                        {t('settings.appearance.high')}
                    </ThemeOptionButton>
                </div>
            </div>

            {/* --- Font Family --- */}
            <div className="settings-group">
                <Label as="h4">
                    <Type size={16} /> {t('settings.appearance.font')}
                </Label>
                <div className="settings-group__controls">
                    <ThemeOptionButton onClick={() => setFont('sans')} isActive={font === 'sans'}>
                        {t('settings.appearance.sansSerif')}
                    </ThemeOptionButton>
                    <ThemeOptionButton onClick={() => setFont('serif')} isActive={font === 'serif'}>
                        {t('settings.appearance.serif')}
                    </ThemeOptionButton>
                    <ThemeOptionButton onClick={() => setFont('mono')} isActive={font === 'mono'}>
                        {t('settings.appearance.monospace')}
                    </ThemeOptionButton>
                </div>
            </div>

            {/* --- Font Size --- */}
            <div className="settings-group">
                <Label as="h4">
                    <CaseSensitive size={16} /> {t('settings.appearance.fontSize')}
                </Label>
                <div className="settings-group__controls font-size-control">
                    <input
                        type="range"
                        min="0.8"
                        max="1.2"
                        step="0.1"
                        value={fontSize}
                        onChange={handleFontSizeChange}
                        className="font-size-slider"
                        aria-label={t('settings.appearance.adjustFontSize')}
                    />
                    <span className="font-size-value">{Math.round(fontSize * 100)}%</span>
                </div>
            </div>
        </div>
    );
};

export default AppearanceTab;
