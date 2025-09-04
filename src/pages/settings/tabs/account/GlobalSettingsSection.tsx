// src/pages/settings/tabs/account/GlobalSettingsSection.tsx

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, BookPlus } from 'lucide-react';

// --- CONTEXTS ---
import { AuthContext } from '../../../../contexts/AuthContext.tsx';

// --- COMPONENTS ---
import Label from '../../../../components/common/Form/Label.tsx';
import Select from '../../../../components/common/Form/Select.tsx';

/**
 * An admin-only section for managing global application settings,
 * such as the default language for new users.
 */
const GlobalSettingsSection: React.FC = () => {
    // --- HOOKS & CONTEXTS ---
    const { t } = useTranslation();
    const auth = useContext(AuthContext);

    // This component should not be rendered if the context is unavailable
    // or if the settings haven't been loaded yet.
    if (!auth || !auth.appSettings) {
        return null;
    }

    const { appSettings, updateAppSettings } = auth;

    // --- EVENT HANDLERS ---

    /**
     * Handles changes to the default language select dropdown.
     */
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = e.target.value as 'en' | 'de';
        updateAppSettings({ defaultLanguage: newLanguage });
    };

    /**
     * Handles toggling the course seeding checkbox.
     * NOTE: The property in the database type is `seedCoursesOnFirstRun`.
     * We will address this naming inconsistency in the final polish phase (Task 4.3).
     */
    const handleSeedCoursesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateAppSettings({ seedCoursesOnFirstRun: e.target.checked });
    };

    // --- RENDER ---
    return (
        <div className="settings-section">
            <h3 className="settings-section__title">{t('settings.global.title')}</h3>
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
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                    </Select>
                </div>
            </div>
            <div className="settings-group">
                <Label as="h4">
                    <BookPlus size={16} /> {t('settings.global.seedCoursesLabel')}
                </Label>
                <div className="settings-group__controls">
                    <input
                        type="checkbox"
                        className="form-checkbox"
                        id="seed-courses-toggle"
                        checked={appSettings.seedCoursesOnFirstRun}
                        onChange={handleSeedCoursesChange}
                    />
                    <Label htmlFor="seed-courses-toggle" className="form-checkbox-label">
                        {t('settings.global.seedCoursesDescription')}
                    </Label>
                </div>
            </div>
        </div>
    );
};

export default GlobalSettingsSection;
