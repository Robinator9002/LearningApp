// src/pages/settings/tabs/AccountTab.tsx

import React, { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext.tsx';

import MyProfileSection from './account/MyProfileSection.tsx';
import UserManagementSection from './account/UserManagementSection.tsx';
// NEW: Import the new global settings component.
import GlobalSettingsSection from './account/GlobalSettingsSection.tsx';

/**
 * The main container tab for all account-related settings.
 * It renders the user's own profile section and, if they are an admin,
 * the sections for managing other users and global application settings.
 */
const AccountTab: React.FC = () => {
    const auth = useContext(AuthContext);
    const currentUser = auth?.currentUser;

    if (!currentUser) {
        // This is a loading state, handled gracefully.
        return <div>{/* Loading... */}</div>;
    }

    return (
        <div className="settings-tab-content">
            <MyProfileSection />
            {currentUser.type === 'admin' && (
                <>
                    <UserManagementSection />
                    {/* NEW: Render the global settings for admins. */}
                    <GlobalSettingsSection />
                </>
            )}
        </div>
    );
};

export default AccountTab;
