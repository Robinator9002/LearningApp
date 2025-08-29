// src/components/settings/UserManagementSection.tsx

import React, { useState, useContext, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import type { IUser } from '../../types/database';
import { ModalContext } from '../../contexts/ModalContext';

import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';
import Input from '../common/Form/Input/Input';
import Label from '../common/Form/Label/Label';
import Select from '../common/Form/Select/Select';

/**
 * UserManagementSection is an admin-only component for managing all user accounts.
 * It provides a list of all users and full CRUD controls for learner accounts.
 */
const UserManagementSection: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserType, setNewUserType] = useState<'learner' | 'admin'>('learner');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<IUser | null>(null);
    const [editedUserName, setEditedUserName] = useState('');

    // --- CONTEXTS & DATA FETCHING ---
    const modal = useContext(ModalContext);
    const users = useLiveQuery(() => db.users.toArray(), []);

    if (!modal) {
        throw new Error('This component must be used within a ModalProvider.');
    }

    useEffect(() => {
        if (editingUser) {
            setEditedUserName(editingUser.name);
        }
    }, [editingUser]);

    // --- EVENT HANDLERS ---
    const handleOpenCreateModal = () => {
        setNewUserName('');
        setNewUserType('learner');
        setIsCreateModalOpen(true);
    };

    const handleSaveNewUser = async () => {
        const trimmedName = newUserName.trim();
        if (!trimmedName) {
            modal.showAlert({ title: 'Invalid Input', message: 'User name cannot be empty.' });
            return;
        }
        try {
            await db.users.add({ name: trimmedName, type: newUserType });
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Failed to create new user:', error);
            modal.showAlert({
                title: 'Creation Error',
                message: 'Could not create the user. The name might already be in use.',
            });
        }
    };

    const handleOpenEditModal = (user: IUser) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        const trimmedName = editedUserName.trim();
        if (!trimmedName) {
            modal.showAlert({ title: 'Invalid Input', message: 'User name cannot be empty.' });
            return;
        }
        try {
            await db.users.update(editingUser.id!, { name: trimmedName });
            setIsEditModalOpen(false);
            setEditingUser(null);
        } catch (error) {
            console.error('Failed to update user:', error);
            modal.showAlert({
                title: 'Update Error',
                message: 'Could not update the user. The name might already be in use.',
            });
        }
    };

    /**
     * Handles the deletion of a user after a confirmation dialog.
     */
    const handleDeleteUser = (user: IUser) => {
        modal.showConfirm({
            title: 'Delete User',
            message: `Are you sure you want to delete the user "${user.name}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await db.users.delete(user.id!);
                } catch (error) {
                    console.error('Failed to delete user:', error);
                    modal.showAlert({
                        title: 'Delete Error',
                        message: 'There was an error deleting the user.',
                    });
                }
            },
        });
    };

    return (
        <>
            <section className="settings-section">
                <div className="settings-section__header">
                    <h3 className="settings-section__title">User Management</h3>
                    <Button variant="primary" onClick={handleOpenCreateModal}>
                        Create New User
                    </Button>
                </div>
                <div className="settings-section__content">
                    <div className="user-list">
                        <div className="user-list__header">
                            <div className="user-list__cell">Name</div>
                            <div className="user-list__cell">Role</div>
                            <div className="user-list__cell">Actions</div>
                        </div>
                        {users ? (
                            users.map((user) => (
                                <div key={user.id} className="user-list__row">
                                    <div className="user-list__cell">{user.name}</div>
                                    <div className="user-list__cell user-list__cell--role">
                                        {user.type}
                                    </div>
                                    <div className="user-list__cell user-list__cell--actions">
                                        {user.type === 'learner' ? (
                                            <>
                                                <Button onClick={() => handleOpenEditModal(user)}>
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

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New User"
            >
                <div className="form-group">
                    <Label htmlFor="new-user-name">User Name</Label>
                    <Input
                        id="new-user-name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g., Alex"
                        autoFocus
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="new-user-type">User Role</Label>
                    <Select
                        id="new-user-type"
                        value={newUserType}
                        onChange={(e) => setNewUserType(e.target.value as typeof newUserType)}
                    >
                        <option value="learner">Learner</option>
                        <option value="admin">Admin</option>
                    </Select>
                </div>
                <div className="modal-footer">
                    <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveNewUser}>
                        Create User
                    </Button>
                </div>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit User: ${editingUser?.name}`}
            >
                <div className="form-group">
                    <Label htmlFor="edit-user-name">New Name</Label>
                    <Input
                        id="edit-user-name"
                        value={editedUserName}
                        onChange={(e) => setEditedUserName(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="modal-footer">
                    <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleUpdateUser}>
                        Save Changes
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default UserManagementSection;
