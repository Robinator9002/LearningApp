// src/pages/settings/SettingsPage.tsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import Button from '../../components/common/Button/Button';
import AccountTab from './tabs/AccountTab';
import AppearanceTab from './tabs/AppearanceTab';

type SettingsTab = 'account' | 'appearance';

/**
 * The main container page for all user settings.
 * It features a tabbed interface to switch between account management
 * and appearance customization.
 */
const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');

    if (!auth?.currentUser) {
        return <div>Loading...</div>;
    }

    return (
        <div className="settings-page">
            <header className="settings-page__header">
                <h2 className="settings-page__title">Settings</h2>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    Close
                </Button>
            </header>

            <div className="settings-page__tabs">
                {/* FIX: Corrected class names to match settings-page.css */}
                <button
                    className={`settings-page__tab ${
                        activeTab === 'account' ? 'settings-page__tab--active' : ''
                    }`}
                    onClick={() => setActiveTab('account')}
                >
                    Account
                </button>
                {/* FIX: Corrected class names to match settings-page.css */}
                <button
                    className={`settings-page__tab ${
                        activeTab === 'appearance' ? 'settings-page__tab--active' : ''
                    }`}
                    onClick={() => setActiveTab('appearance')}
                >
                    Appearance
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
