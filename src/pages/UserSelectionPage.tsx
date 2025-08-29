// src/pages/UserSelectionPage.tsx

import React, { useContext, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { db } from '../lib/db';
import { AuthContext } from '../contexts/AuthContext';
import type { IUser } from '../types/database';

import Button from '../components/common/Button/Button';
import Input from '../components/common/Form/Input/Input';
import Label from '../components/common/Form/Label/Label';

/**
 * The page where users select their profile to log in.
 * Now handles the "first-run" experience if no users exist.
 */
const UserSelectionPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [adminName, setAdminName] = useState('');

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

    const handleCreateFirstAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminName.trim()) {
            // In a real app, you might use the ModalContext to show an error
            alert('Please enter a name for the admin account.');
            return;
        }

        try {
            const newUser: IUser = {
                name: adminName.trim(),
                type: 'admin',
            };
            // Add the new user and get their generated ID
            const newId = await db.users.add(newUser);
            const createdUser = await db.users.get(newId);

            if (createdUser) {
                // Automatically log in as the new admin
                auth.login(createdUser);
                navigate('/admin');
            }
        } catch (error) {
            console.error('Failed to create the first admin user:', error);
            // You could show a modal error here as well
            alert('Could not create the admin account. The name might already be taken.');
        }
    };

    // Render a loading state while Dexie initializes and fetches users
    if (users === undefined) {
        return <p>Loading profiles...</p>;
    }

    // If the database is empty, show the first-run admin creation form
    if (users.length === 0) {
        return (
            <div className="user-select">
                <h2 className="user-select__title">Welcome! Let's get started.</h2>
                <p className="user-select__subtitle">
                    Create the first Admin account to manage the app.
                </p>
                <form className="user-select__form" onSubmit={handleCreateFirstAdmin}>
                    <div className="form-group">
                        <Label htmlFor="admin-name">Admin Name</Label>
                        <Input
                            id="admin-name"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <Button type="submit" variant="primary">
                        Create Admin Account
                    </Button>
                </form>
            </div>
        );
    }

    // Otherwise, show the standard user selection screen
    return (
        <div className="user-select">
            <h2 className="user-select__title">{t('userSelection.title')}</h2>
            <div className="user-select__actions">
                {users.map((user) => (
                    <Button key={user.id} onClick={() => handleUserSelect(user)}>
                        {user.name}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default UserSelectionPage;
