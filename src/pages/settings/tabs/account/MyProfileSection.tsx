// src/pages/settings/tabs/MyProfileSection.tsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { db } from '../../../../lib/db';
import { AuthContext } from '../../../../contexts/AuthContext';
import { ModalContext } from '../../../../contexts/ModalContext';

import Button from '../../../../components/common/Button/Button';
import Modal from '../../../../components/common/Modal/Modal';
import Input from '../../../../components/common/Form/Input/Input';
import Label from '../../../../components/common/Form/Label/Label';

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

export default MyProfileSection;
