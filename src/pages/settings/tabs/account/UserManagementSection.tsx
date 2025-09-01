// src/pages/settings/tabs/UserManagementSection.tsx

import React, { useState, useContext, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '../../../../lib/db';
import { ModalContext } from '../../../../contexts/ModalContext';
import type { IUser } from '../../../../types/database';

import Button from '../../../../components/common/Button/Button';
import Modal from '../../../../components/common/Modal/Modal';
import Input from '../../../../components/common/Form/Input';
import Label from '../../../../components/common/Form/Label';
import Select from '../../../../components/common/Form/Select';

/**
 * A section visible only to admins for managing all learner accounts.
 */
const UserManagementSection: React.FC = () => {
    const modal = useContext(ModalContext);

    // --- State for Modals ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<IUser | null>(null);

    // --- State for Forms ---
    const [newUserName, setNewUserName] = useState('');
    const [newUserType, setNewUserType] = useState<'learner' | 'admin'>('learner');

    // Fetch all users
    const users = useLiveQuery(() => db.users.toArray(), []);
    const learners = users?.filter((u) => u.type === 'learner');

    // Reset form when modals close
    useEffect(() => {
        if (!isCreateModalOpen) {
            setNewUserName('');
            setNewUserType('learner');
        }
        if (!isEditModalOpen) {
            setEditingUser(null);
        }
    }, [isCreateModalOpen, isEditModalOpen]);

    if (!modal) {
        throw new Error('Component must be used within ModalProvider');
    }

    /**
     * Handles the logic for creating a new user.
     */
    const handleCreateUser = async () => {
        if (!newUserName.trim()) {
            modal.showAlert({ title: 'Validation Error', message: 'Name cannot be empty.' });
            return;
        }
        try {
            await db.users.add({
                name: newUserName.trim(),
                type: newUserType,
            });
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Failed to create user:', error);
            modal.showAlert({ title: 'Error', message: 'A user with this name already exists.' });
        }
    };

    /**
     * Handles the logic for updating a learner's name.
     */
    const handleUpdateUser = async () => {
        if (!editingUser || !newUserName.trim()) {
            modal.showAlert({ title: 'Validation Error', message: 'Name cannot be empty.' });
            return;
        }
        try {
            await db.users.update(editingUser.id!, {
                name: newUserName.trim(),
                type: newUserType,
            });
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to update user:', error);
            modal.showAlert({ title: 'Error', message: 'Failed to update user.' });
        }
    };

    /**
     * Opens the edit modal and pre-populates it with the selected user's data.
     */
    const openEditModal = (user: IUser) => {
        setEditingUser(user);
        setNewUserName(user.name);
        setNewUserType(user.type);
        setIsEditModalOpen(true);
    };

    /**
     * Handles the logic for deleting a learner account.
     */
    const handleDeleteUser = (userToDelete: IUser) => {
        modal.showConfirm({
            title: `Delete User: ${userToDelete.name}`,
            message: 'Are you sure? All progress data for this user will be lost permanently.',
            onConfirm: async () => {
                try {
                    await db.transaction('rw', db.users, db.progressLogs, async () => {
                        // Delete the user
                        await db.users.delete(userToDelete.id!);
                        // Delete all associated progress logs
                        await db.progressLogs.where('userId').equals(userToDelete.id!).delete();
                    });
                } catch (error) {
                    console.error('Failed to delete user and their progress:', error);
                    modal.showAlert({
                        title: 'Error',
                        message: 'Failed to delete user.',
                    });
                }
            },
        });
    };

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <h3 className="settings-section__title">Manage Accounts</h3>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    Create New Account
                </Button>
            </div>
            <div className="user-list">
                {learners && learners.length > 0 ? (
                    learners.map((user) => (
                        <div key={user.id} className="user-list-item">
                            <span className="user-list-item__name">{user.name}</span>
                            <div className="user-list-item__actions">
                                <Button variant="secondary" onClick={() => openEditModal(user)}>
                                    Edit
                                </Button>
                                <Button variant="danger" onClick={() => handleDeleteUser(user)}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No other learner accounts found.</p>
                )}
            </div>

            {/* --- Modals for Admin Actions --- */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Account"
            >
                <div className="form-group">
                    <Label htmlFor="new-user-name">Name</Label>
                    <Input
                        id="new-user-name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="new-user-type">Account Type</Label>
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
                    <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateUser}>
                        Create Account
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Account: ${editingUser?.name}`}
            >
                <div className="form-group">
                    <Label htmlFor="edit-user-name">Name</Label>
                    <Input
                        id="edit-user-name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="edit-user-type">Account Type</Label>
                    <Select
                        id="edit-user-type"
                        value={newUserType}
                        onChange={(e) => setNewUserType(e.target.value as typeof newUserType)}
                    >
                        <option value="learner">Learner</option>
                        <option value="admin">Admin</option>
                    </Select>
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpdateUser}>
                        Save Changes
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagementSection;
