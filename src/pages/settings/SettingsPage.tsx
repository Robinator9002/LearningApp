// src/pages/settings/SettingsPage.tsx

import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

// Import the section components
import ProfileSection from '../../components/settings/ProfileSection';
import AppearanceSection from '../../components/settings/AppearanceSection';

/**
 * SettingsPage serves as a central hub for all user-related configurations.
 * It is composed of modular sections for different settings categories.
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
                {/* The ProfileSection allows users to edit their own name. */}
                <ProfileSection currentUser={currentUser} />

                {/* The AppearanceSection provides controls for the app's theme. */}
                <AppearanceSection />

                {/*
                  Placeholder for the final section:
                  - UserManagementSection (Admin only)
                */}
            </div>
        </div>
    );
};

export default SettingsPage;
