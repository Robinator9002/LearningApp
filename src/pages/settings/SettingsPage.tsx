// src/pages/settings/SettingsPage.tsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import Button from '../../components/common/Button/Button';
// NOTE: We will create these tab components in the next steps
// import AccountTab from './AccountTab';
// import AppearanceTab from './AppearanceTab';

type SettingsTab = 'account' | 'appearance';

/**
 * The main container for all user and application settings.
 * It uses a tabbed interface to separate concerns.
 */
const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');

    if (!auth?.currentUser) {
        // This should be caught by the protected route, but it's a good safeguard.
        return <div>Loading user information...</div>;
    }

    return (
        <div className="settings-page">
            <header className="settings-page__header">
                <div className="settings-page__header-left">
                    <Button onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} />
                    </Button>
                    <h2 className="settings-page__title">Settings</h2>
                </div>
                <div className="settings-page__tabs">
                    <button
                        className={`settings-page__tab ${
                            activeTab === 'account' ? 'settings-page__tab--active' : ''
                        }`}
                        onClick={() => setActiveTab('account')}
                    >
                        Account
                    </button>
                    <button
                        className={`settings-page__tab ${
                            activeTab === 'appearance' ? 'settings-page__tab--active' : ''
                        }`}
                        onClick={() => setActiveTab('appearance')}
                    >
                        Appearance
                    </button>
                </div>
            </header>

            <main className="settings-page__content">
                {/* We will replace these placeholders with the actual tab components */}
                {activeTab === 'account' && <div>ACCOUNT TAB CONTENT</div>}
                {activeTab === 'appearance' && <div>APPEARANCE TAB CONTENT</div>}
            </main>
        </div>
    );
};

export default SettingsPage;
