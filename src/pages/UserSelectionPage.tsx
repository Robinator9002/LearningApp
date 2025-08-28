// src/pages/UserSelectionPage.tsx

import React, { useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { db } from '../lib/db';
import { AuthContext } from '../contexts/AuthContext';
import type { IUser } from '../types/database';

import Button from '../components/common/Button/Button';

/**
 * The page where users select their profile to log in.
 */
const UserSelectionPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    // Fetch all users from the database in real-time
    const users = useLiveQuery(() => db.users.toArray(), []);

    if (!auth) {
        // This should not happen if the component is rendered within AuthProvider
        throw new Error('AuthContext is not available');
    }

    const handleUserSelect = (user: IUser) => {
        auth.login(user);
        // Navigate to the appropriate dashboard based on user type
        if (user.type === 'admin') {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="user-select">
            <h2 className="user-select__title">{t('userSelection.title')}</h2>
            <div className="user-select__actions">
                {users ? (
                    users.map((user) => (
                        <Button key={user.id} onClick={() => handleUserSelect(user)}>
                            {user.name}
                        </Button>
                    ))
                ) : (
                    <p>Loading profiles...</p>
                )}
            </div>
        </div>
    );
};

export default UserSelectionPage;
