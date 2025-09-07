// src/pages/settings/tabs/AccountTab.tsx

import React, { useContext } from 'react';
// FIX: Adjusted the relative path to the contexts directory.
import { AuthContext } from '../../../contexts/AuthContext.tsx';

import MyProfileSection from './account/MyProfileSection.tsx';
import UserManagementSection from './account/UserManagementSection.tsx';

/**
 * The main container tab for all account-related settings.
 * It renders the user's own profile section and, if they are an admin,
 * the section for managing other users.
 */
const AccountTab: React.FC = () => {
    const auth = useContext(AuthContext);
    const currentUser = auth?.currentUser;

    if (!currentUser) {
        return <div>{/* Loading... */}</div>;
    }

    return (
        <div className="settings-tab-content">
            <MyProfileSection />
            {/* The UserManagementSection is now the only admin-specific part of this tab. */}
            {currentUser.type === 'admin' && <UserManagementSection />}
        </div>
    );
};

export default AccountTab;
