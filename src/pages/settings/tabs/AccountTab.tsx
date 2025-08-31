// src/pages/settings/tabs/AccountTab.tsx

import React, { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';

import MyProfileSection from './account/MyProfileSection';
import UserManagementSection from './account/UserManagementSection';

/**
 * The main container tab for all account-related settings.
 * It renders the user's own profile section and, if they are an admin,
 * the section for managing other users.
 */
const AccountTab: React.FC = () => {
    const auth = useContext(AuthContext);
    const currentUser = auth?.currentUser;

    if (!currentUser) {
        return <div>Loading user information...</div>;
    }

    return (
        <div>
            <MyProfileSection />
            {currentUser.type === 'admin' && <UserManagementSection />}
        </div>
    );
};

export default AccountTab;
