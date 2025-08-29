// src/pages/settings/SettingsPage.tsx

import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

// Import all three section components
import ProfileSection from '../../components/settings/ProfileSection';
import AppearanceSection from '../../components/settings/AppearanceSection';
import UserManagementSection from '../../components/settings/UserManagementSection';

/**
 * SettingsPage serves as a central hub for all user-related configurations.
 * It is composed of modular sections, with some being conditionally rendered
 * based on the current user's role.
 */
const SettingsPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const { currentUser } = auth ?? {};

    // Guard against rendering without a user.
    if (!currentUser) {
        return <div>Loading user data...</div>;
    }

    return (
        <div className="settings-page">
            <header className="settings-page__header">
                <h2 className="settings-page__title">Settings</h2>
            </header>

            <div className="settings-page__content">
                {/* This section is visible to all logged-in users. */}
                <ProfileSection currentUser={currentUser} />

                {/* This section is also visible to all logged-in users. */}
                <AppearanceSection />

                {/*
                  CONDITIONAL RENDERING:
                  The UserManagementSection is only rendered if the current user's
                  type is 'admin'. This is the core of our permission model for the UI.
                */}
                {currentUser.type === 'admin' && <UserManagementSection />}
            </div>
        </div>
    );
};

export default SettingsPage;
