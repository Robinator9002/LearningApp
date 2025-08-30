// src/pages/settings/tabs/AccountTab.tsx

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { AuthContext } from '../../../contexts/AuthContext';
import { ModalContext } from '../../../contexts/ModalContext';
import type { IUser } from '../../../types/database';

import Button from '../../../components/common/Button/Button';
import Modal from '../../../components/common/Modal/Modal';
import Input from '../../../components/common/Form/Input/Input';
import Label from '../../../components/common/Form/Label/Label';
import Select from '../../../components/common/Form/Select/Select';

// --- SUB-COMPONENTS ---

/**
 * A dedicated section for the current user to manage their own profile.
 * It handles name changes, password management, and account deletion.
 */
const MyProfileSection: React.FC = () => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);
    const currentUser = auth?.currentUser;

    // --- State for Modals ---
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // --- State for Forms ---
    const [newName, setNewName] = useState(currentUser?.name || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Ensure providers are available
    if (!auth || !modal || !currentUser) {
        throw new Error('This component must be used within all required providers.');
    }

    /**
     * Handles the logic for updating the user's name.
     */
    const handleNameChange = async () => {
        if (!newName.trim()) {
            modal.showAlert({ title: 'Validation Error', message: 'Name cannot be empty.' });
            return;
        }
        try {
            await db.users.update(currentUser.id!, { name: newName.trim() });
            // Refresh the user in the auth context to reflect the change globally
            auth.login({ ...currentUser, name: newName.trim() });
            modal.showAlert({ title: 'Success', message: 'Your name has been updated.' });
            setIsNameModalOpen(false);
        } catch (error) {
            console.error('Failed to update name:', error);
            modal.showAlert({ title: 'Error', message: 'Failed to update name.' });
        }
    };

    /**
     * Handles the logic for setting, changing, or removing a user's password.
     */
    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            modal.showAlert({ title: 'Validation Error', message: 'Passwords do not match.' });
            return;
        }
        try {
            // An empty password means the user wants to remove it
            const passwordToSet = newPassword.trim() === '' ? undefined : newPassword.trim();
            await db.users.update(currentUser.id!, { password: passwordToSet });
            auth.login({ ...currentUser, password: passwordToSet });
            modal.showAlert({ title: 'Success', message: 'Your password has been updated.' });
            setIsPasswordModalOpen(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Failed to update password:', error);
            modal.showAlert({ title: 'Error', message: 'Failed to update password.' });
        }
    };

    /**
     * Handles the logic for deleting the user's own account.
     */
    const handleDeleteAccount = () => {
        modal.showConfirm({
            title: 'Delete Account',
            message:
                'Are you sure you want to delete your account? This action is permanent and cannot be undone.',
            onConfirm: async () => {
                try {
                    await db.users.delete(currentUser.id!);
                    auth.logout();
                    navigate('/'); // Redirect to the user selection screen
                } catch (error) {
                    console.error('Failed to delete account:', error);
                    modal.showAlert({
                        title: 'Error',
                        message: 'Failed to delete your account.',
                    });
                }
            },
        });
    };

    return (
        <div className="settings-section">
            <h3 className="settings-section__title">My Profile</h3>

            {/* --- Name Management --- */}
            <div className="settings-group">
                <Label as="h4">Name</Label>
                <div className="settings-group__controls settings-group__controls--inline">
                    <span className="settings-group__text-value">{currentUser.name}</span>
                    <Button variant="secondary" onClick={() => setIsNameModalOpen(true)}>
                        Edit Name
                    </Button>
                </div>
            </div>

            {/* --- Password Management --- */}
            <div className="settings-group">
                <Label as="h4">Password</Label>
                <div className="settings-group__controls">
                    <Button variant="secondary" onClick={() => setIsPasswordModalOpen(true)}>
                        {currentUser.password ? 'Change Password' : 'Set Password'}
                    </Button>
                </div>
            </div>

            {/* --- Account Deletion --- */}
            <div className="settings-group">
                <Label as="h4">Delete Account</Label>
                <div className="settings-group__controls">
                    <Button variant="danger" onClick={handleDeleteAccount}>
                        Delete My Account
                    </Button>
                </div>
            </div>

            {/* --- Modals --- */}
            <Modal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                title="Edit Your Name"
            >
                <div className="form-group">
                    <Label htmlFor="edit-name">New Name</Label>
                    <Input
                        id="edit-name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setIsNameModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleNameChange}>
                        Save Changes
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title={currentUser.password ? 'Change Your Password' : 'Set a New Password'}
            >
                <p className="modal-description">
                    Leave both fields blank to remove your password entirely.
                </p>
                <div className="form-group">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handlePasswordChange}>
                        Save Password
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

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

    // Fetch all users (excluding the current admin)
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
