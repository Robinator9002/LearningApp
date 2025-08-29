// src/pages/settings/SettingsPage.tsx

import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

// Import the new ProfileSection component
import ProfileSection from '../../components/settings/ProfileSection';

/**
 * SettingsPage serves as a central hub for all user-related configurations.
 * It is composed of modular sections for different settings categories.
 */
const SettingsPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const { currentUser } = auth ?? {};

    // Guard against rendering without a user. ProtectedRoute should handle this,
    // but this prevents potential crashes.
    if (!currentUser) {
        return <div>Loading user data...</div>;
    }

    return (
        <div className="settings-page">
            <header className="settings-page__header">
                <h2 className="settings-page__title">Settings</h2>
            </header>

            <div className="settings-page__content">
                {/*
                  The ProfileSection is now rendered here. It receives the
                  currentUser object to display the user's name and will
                  eventually handle editing that specific user's profile.
                */}
                <ProfileSection currentUser={currentUser} />

                {/*
                  Placeholder for future sections:
                  - AppearanceSection
                  - UserManagementSection (Admin only)
                */}
            </div>
        </div>
    );
};

export default SettingsPage;
