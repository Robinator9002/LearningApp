// src/pages/settings/tabs/AccountTab.tsx

import React from 'react';
import ProfileSection from '../../../components/settings/ProfileSection';
import UserManagementSection from '../../../components/settings/UserManagementSection';
import { type IUser } from '../../../types/database';

interface AccountTabProps {
    /**
     * The currently logged-in user.
     */
    currentUser: IUser;
}

/**
 * The AccountTab component serves as a container for all user-related settings.
 * It displays the user's own profile management tools and, if the user is an admin,
 * it also displays the tools for managing other learner accounts.
 */
const AccountTab: React.FC<AccountTabProps> = ({ currentUser }) => {
    return (
        <div className="account-settings">
            {/* --- Section 1: User's Own Profile --- */}
            {/* This section is visible to ALL users (admins and learners). */}
            <ProfileSection user={currentUser} />

            {/* --- Section 2: Admin-Only User Management --- */}
            {/* This section is ONLY visible if the current user is an admin. */}
            {currentUser.type === 'admin' && <UserManagementSection />}
        </div>
    );
};

export default AccountTab;
