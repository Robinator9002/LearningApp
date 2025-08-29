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
 * This component now includes a "first-run" experience to guide the
 * initial user in creating the first administrator account if the database is empty.
 */
const UserSelectionPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [adminName, setAdminName] = useState('');

    // Fetch all users from the database in real-time.
    // `users` will be `undefined` during the initial loading state.
    const users = useLiveQuery(() => db.users.toArray(), []);

    // Ensure the component is wrapped in an AuthProvider
    if (!auth) {
        throw new Error('UserSelectionPage must be used within an AuthProvider');
    }

    /**
     * Handles logging in an existing user and navigating to their dashboard.
     * @param user The user object to log in.
     */
    const handleUserSelect = (user: IUser) => {
        auth.login(user);
        if (user.type === 'admin') {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    };

    /**
     * Handles the form submission for creating the very first admin user.
     * This is only shown when the `users` table in the database is empty.
     */
    const handleCreateFirstAdmin = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission behavior
        if (!adminName.trim()) {
            // Basic validation: In a larger app, we might use the ModalContext here.
            console.error('Admin name cannot be empty.');
            return;
        }

        try {
            const newUser: IUser = {
                name: adminName.trim(),
                type: 'admin',
            };

            // Add the new user to the database and retrieve their generated ID.
            const newId = await db.users.add(newUser);
            const createdUser = await db.users.get(newId);

            // If the user was successfully created and retrieved, log them in.
            if (createdUser) {
                auth.login(createdUser);
                navigate('/admin'); // Redirect to the admin dashboard
            }
        } catch (error) {
            console.error('Failed to create the first admin user:', error);
            // Handle potential errors, such as a unique name constraint violation.
        }
    };

    // While Dexie is initializing and fetching data, `users` is undefined.
    // We show a generic loading message to prevent a flash of incorrect UI.
    if (users === undefined) {
        return <p>Loading profiles...</p>;
    }

    // --- Conditional Rendering Logic ---

    // If the users array is empty, we render the "First-Run" experience.
    if (users.length === 0) {
        return (
            <div className="user-select">
                <h2 className="user-select__title">Welcome! Let's Get Started.</h2>
                <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                    Create the first Admin account to manage the app.
                </p>
                <form
                    className="user-select__form"
                    onSubmit={handleCreateFirstAdmin}
                    style={{ width: '100%', maxWidth: '300px' }}
                >
                    <div className="form-group">
                        <Label htmlFor="admin-name">Admin Name</Label>
                        <Input
                            id="admin-name"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder="Enter your name"
                            required
                            autoFocus
                        />
                    </div>
                    <Button type="submit" variant="primary" style={{ width: '100%' }}>
                        Create Admin Account
                    </Button>
                </form>
            </div>
        );
    }

    // If users exist, we render the standard profile selection screen.
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
