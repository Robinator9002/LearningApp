// src/pages/settings/SettingsPage.tsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext.tsx';
import Button from '../../components/common/Button.tsx';
// FIX: Added file extensions to all local component imports.
import AccountTab from './tabs/AccountTab.tsx';
import AppearanceTab from './tabs/AppearanceTab.tsx';
import GlobalTab from './tabs/GlobalTab.tsx';

type SettingsTab = 'account' | 'appearance' | 'global';

/**
 * The main container page for all user settings.
 */
const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const auth = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');

    if (!auth?.currentUser) {
        return <div>{t('loading.user')}</div>;
    }

    const { currentUser } = auth;
    const isAdmin = currentUser.type === 'admin';

    return (
        <div className="settings-page">
            <header className="settings-page__header">
                <h2 className="settings-page__title">{t('settings.title')}</h2>
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
                    {t('settings.tabs.account')}
                </button>
                <button
                    className={`settings-page__tab ${
                        activeTab === 'appearance' ? 'settings-page__tab--active' : ''
                    }`}
                    onClick={() => setActiveTab('appearance')}
                >
                    {t('settings.tabs.appearance')}
                </button>
                {isAdmin && (
                    <button
                        className={`settings-page__tab ${
                            activeTab === 'global' ? 'settings-page__tab--active' : ''
                        }`}
                        onClick={() => setActiveTab('global')}
                    >
                        {t('settings.tabs.global')}
                    </button>
                )}
            </div>

            <main className="settings-page__content">
                {activeTab === 'account' && <AccountTab />}
                {activeTab === 'appearance' && <AppearanceTab />}
                {activeTab === 'global' && isAdmin && <GlobalTab />}
            </main>
        </div>
    );
};

export default SettingsPage;
