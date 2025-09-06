// src/pages/UserSelectionPage.tsx

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

// --- CONTEXTS ---
import { AuthContext } from '../contexts/AuthContext.tsx';

// --- COMPONENTS ---
// FIX: Corrected import paths to point to the components in the same directory.
import FirstAdminSetup from './user/FirstAdminSetup.tsx';
import UserGrid from './user/UserGrid.tsx';

/**
 * The main container page for user selection.
 * This component now acts as a simple router, deciding whether to show
 * the initial setup screen or the standard user grid based on whether
 * any users exist in the database.
 */
const UserSelectionPage: React.FC = () => {
    const { t } = useTranslation();
    const auth = useContext(AuthContext);

    if (!auth) {
        throw new Error('UserSelectionPage must be used within an AuthProvider');
    }
    const { users, isLoading } = auth;

    // --- RENDER LOGIC ---

    // Display a loading state while the AuthContext is initializing.
    if (isLoading) {
        return <div>{t('labels.loading')}</div>;
    }

    // The main conditional rendering logic.
    return (
        <div className="user-select">
            {users.length === 0 ? (
                // If no users exist, it's a first run; show the setup component.
                <div className="user-select__first-run">
                    <h2 className="user-select__title">{t('setup.title')}</h2>
                    <p className="user-select__subtitle">{t('setup.subtitle')}</p>
                    <FirstAdminSetup />
                </div>
            ) : (
                // Otherwise, show the standard grid of users.
                <UserGrid />
            )}
        </div>
    );
};

export default UserSelectionPage;
