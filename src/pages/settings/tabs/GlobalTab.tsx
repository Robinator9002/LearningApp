// src/pages/settings/tabs/GlobalTab.tsx

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, BookPlus, Palette } from 'lucide-react';

// --- CONTEXTS ---
import { AuthContext } from '../../../contexts/AuthContext.tsx';

// --- COMPONENTS ---
import Label from '../../../components/common/Form/Label.tsx';
import Select from '../../../components/common/Form/Select.tsx';
import StarterCourseImporter from '../../../components/admin/Course/StarterCourseImporter.tsx';

/**
 * An admin-only tab for managing all global application settings.
 */
const GlobalTab: React.FC = () => {
    // --- HOOKS & CONTEXTS ---
    const { t } = useTranslation();
    const auth = useContext(AuthContext);

    if (!auth || !auth.appSettings) {
        return null; // Render nothing if context or settings are not available
    }

    const { appSettings, updateAppSettings } = auth;

    // --- EVENT HANDLERS ---

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = e.target.value as 'en' | 'de';
        updateAppSettings({ defaultLanguage: newLanguage });
    };

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTheme = e.target.value as 'light' | 'dark';
        updateAppSettings({ defaultTheme: newTheme });
    };

    // --- RENDER ---
    return (
        <div className="settings-tab-content">
            <div className="settings-section">
                <h3 className="settings-section__title">{t('settings.global.title')}</h3>

                {/* Default Language Setting */}
                <div className="settings-group">
                    <Label as="h4">
                        <Globe size={16} /> {t('settings.global.defaultLanguageLabel')}
                    </Label>
                    <div className="settings-group__controls">
                        <Select
                            value={appSettings.defaultLanguage}
                            onChange={handleLanguageChange}
                            aria-label={t('settings.global.defaultLanguageLabel')}
                        >
                            <option value="en">{t('languages.en')}</option>
                            <option value="de">{t('languages.de')}</option>
                        </Select>
                    </div>
                </div>

                {/* Default Theme Setting */}
                <div className="settings-group">
                    <Label as="h4">
                        <Palette size={16} /> {t('settings.global.defaultThemeLabel')}
                    </Label>
                    <div className="settings-group__controls">
                        <Select
                            value={appSettings.defaultTheme}
                            onChange={handleThemeChange}
                            aria-label={t('settings.global.defaultThemeLabel')}
                        >
                            <option value="light">{t('settings.appearance.light')}</option>
                            <option value="dark">{t('settings.appearance.dark')}</option>
                        </Select>
                    </div>
                </div>

                {/* Starter Courses Setting */}
                <div className="settings-group">
                    <Label as="h4">
                        <BookPlus size={16} /> {t('settings.global.seedCoursesLabel')}
                    </Label>
                    <div className="settings-group__controls">
                        <StarterCourseImporter />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalTab;
