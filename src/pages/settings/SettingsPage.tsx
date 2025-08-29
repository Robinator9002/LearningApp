// src/pages/settings/SettingsPage.tsx

import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

/**
 * SettingsPage serves as a central hub for all user-related configurations.
 * It will contain sections for profile management, appearance customization,
 * and, for admin users, user management tools.
 */
const SettingsPage: React.FC = () => {
    // Access the current user's data from the authentication context.
    // This will be used to conditionally render components (like the admin-only
    // user management panel) and to pass user info down to child components.
    const auth = useContext(AuthContext);
    const { currentUser } = auth ?? {};

    // A simple guard to ensure that currentUser is available before rendering.
    // In a real-world scenario, a more robust loading state might be preferable,
    // but ProtectedRoute should prevent this page from being accessed without a user.
    if (!currentUser) {
        return <div>Loading user data...</div>;
    }

    return (
        <div className="settings-page">
            {/* Page header */}
            <header className="settings-page__header">
                <h2 className="settings-page__title">Settings</h2>
            </header>

            {/* Main content area where different settings sections will be rendered */}
            <div className="settings-page__content">
                {/*
                    The following sections will be built out as separate components:
                    1. ProfileSection: For changing the user's own name. (Visible to all)
                    2. AppearanceSection: For theme and style adjustments. (Visible to all)
                    3. UserManagementSection: For admin users to manage other accounts. (Admin only)
                */}
                <p>Settings sections will be added here.</p>
            </div>
        </div>
    );
};

export default SettingsPage;
