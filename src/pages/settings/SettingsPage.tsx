// src/pages/settings/SettingsPage.tsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation
import { AuthContext } from '../../contexts/AuthContext';
import Button from '../../components/common/Button/Button';
import AccountTab from './tabs/AccountTab';
import AppearanceTab from './tabs/AppearanceTab';

type SettingsTab = 'account' | 'appearance';

/**
 * The main container page for all user settings.
 */
const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation
    const auth = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');

    if (!auth?.currentUser) {
        return <div>{t('loading.user')}</div>; // MODIFICATION: Translated loading text
    }

    return (
        <div className="settings-page">
            <header className="settings-page__header">
                {/* MODIFICATION: Replaced hardcoded title */}
                <h2 className="settings-page__title">{t('settings.title')}</h2>
                {/* MODIFICATION: Replaced hardcoded button text */}
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    {t('buttons.close')}
                </Button>
            </header>

            <div className="settings-page__tabs">
                <button
                    className={`settings-page__tab ${
                        activeTab === 'account' ? 'settings-page__tab--active' : ''
                    }`}
                    onClick={() => setActiveTab('account')}
                >
                    {/* MODIFICATION: Replaced hardcoded tab name */}
                    {t('settings.tabs.account')}
                </button>
                <button
                    className={`settings-page__tab ${
                        activeTab === 'appearance' ? 'settings-page__tab--active' : ''
                    }`}
                    onClick={() => setActiveTab('appearance')}
                >
                    {/* MODIFICATION: Replaced hardcoded tab name */}
                    {t('settings.tabs.appearance')}
                </button>
            </div>

            <main className="settings-page__content">
                {activeTab === 'account' && <AccountTab />}
                {activeTab === 'appearance' && <AppearanceTab />}
            </main>
        </div>
    );
};

export default SettingsPage;
