// src/components/settings/UserManagementSection.tsx

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import type { IUser } from '../../types/database';
import Button from '../common/Button/Button';

/**
 * UserManagementSection is an admin-only component for managing all user accounts.
 * It provides a list of all users and controls for creating, editing,
 * and deleting learner accounts.
 */
const UserManagementSection: React.FC = () => {
    // Fetch all users from the database in real-time so the list is always current.
    const users = useLiveQuery(() => db.users.toArray(), []);

    // Placeholder handlers for the CRUD operations.
    // These will be implemented with modal logic in the next phase.
    const handleCreateUser = () => console.log('TODO: Implement user creation');
    const handleEditUser = (user: IUser) => console.log('TODO: Implement editing for', user.name);
    const handleDeleteUser = (user: IUser) =>
        console.log('TODO: Implement deletion for', user.name);

    return (
        <section className="settings-section">
            <div className="settings-section__header">
                <h3 className="settings-section__title">User Management</h3>
                <Button variant="primary" onClick={handleCreateUser}>
                    Create New User
                </Button>
            </div>
            <div className="settings-section__content">
                <div className="user-list">
                    {/* Header for the user list table */}
                    <div className="user-list__header">
                        <div className="user-list__cell">Name</div>
                        <div className="user-list__cell">Role</div>
                        <div className="user-list__cell">Actions</div>
                    </div>
                    {/* Render a row for each user */}
                    {users ? (
                        users.map((user) => (
                            <div key={user.id} className="user-list__row">
                                <div className="user-list__cell">{user.name}</div>
                                <div className="user-list__cell user-list__cell--role">
                                    {user.type}
                                </div>
                                <div className="user-list__cell user-list__cell--actions">
                                    {/* Admins cannot edit or delete other admins */}
                                    {user.type === 'learner' ? (
                                        <>
                                            <Button onClick={() => handleEditUser(user)}>
                                                Edit
                                            </Button>
                                            <Button onClick={() => handleDeleteUser(user)}>
                                                Delete
                                            </Button>
                                        </>
                                    ) : (
                                        <span className="user-list__cell--no-actions">
                                            (No actions available)
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>Loading users...</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default UserManagementSection;
