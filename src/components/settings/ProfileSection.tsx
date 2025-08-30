// src/components/settings/ProfileSection.tsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db';
import { AuthContext } from '../../contexts/AuthContext';
import { ModalContext } from '../../contexts/ModalContext';
import type { IUser } from '../../types/database';
import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';
import Input from '../common/Form/Input/Input';
import Label from '../common/Form/Label/Label';

interface ProfileSectionProps {
    /**
     * The user object for the profile being displayed.
     */
    user: IUser;
}

/**
 * A component for displaying and managing a user's own profile information.
 */
const ProfileSection: React.FC<ProfileSectionProps> = ({ user }) => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    // State for the edit name modal
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [newName, setNewName] = useState(user.name);

    // State for the change password modal
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!auth || !modal) {
        throw new Error('ProfileSection must be used within AuthProvider and ModalProvider');
    }

    const handleNameChange = async () => {
        if (!newName.trim()) {
            modal.showAlert({ title: 'Error', message: 'Name cannot be empty.' });
            return;
        }
        try {
            await db.users.update(user.id!, { name: newName });
            // If the user is editing their own name, we need to update the auth context
            if (auth.currentUser?.id === user.id) {
                auth.login({ ...user, name: newName });
            }
            modal.showAlert({ title: 'Success', message: 'Your name has been updated.' });
            setIsNameModalOpen(false);
        } catch (error) {
            console.error('Failed to update name:', error);
            modal.showAlert({ title: 'Error', message: 'This name is already taken.' });
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword.length > 0 && newPassword.length < 4) {
            modal.showAlert({
                title: 'Error',
                message: 'Password must be at least 4 characters long.',
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            modal.showAlert({ title: 'Error', message: 'Passwords do not match.' });
            return;
        }
        try {
            // An empty password will remove the password requirement
            const passwordToSave = newPassword.length > 0 ? newPassword : undefined;
            await db.users.update(user.id!, { password: passwordToSave });

            modal.showAlert({ title: 'Success', message: 'Your password has been updated.' });
            setIsPasswordModalOpen(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Failed to update password:', error);
            modal.showAlert({ title: 'Error', message: 'Could not update password.' });
        }
    };

    const handleDeleteAccount = () => {
        modal.showConfirm({
            title: 'Delete Account',
            message: `Are you sure you want to delete the account "${user.name}"? This action is permanent and cannot be undone.`,
            onConfirm: async () => {
                try {
                    await db.users.delete(user.id!);
                    // If the user deleted themselves, log them out and go to the home page.
                    if (auth.currentUser?.id === user.id) {
                        auth.logout();
                        navigate('/');
                    }
                } catch (error) {
                    console.error('Failed to delete user:', error);
                    modal.showAlert({ title: 'Error', message: 'Could not delete account.' });
                }
            },
        });
    };

    return (
        <div className="settings-section">
            <h3 className="settings-section__title">My Profile</h3>
            <div className="settings-group">
                <Label>Name</Label>
                <div className="settings-group__controls settings-group__controls--inline">
                    <p className="settings-group__text-value">{user.name}</p>
                    <Button onClick={() => setIsNameModalOpen(true)}>Edit Name</Button>
                </div>
            </div>
            <div className="settings-group">
                <Label>Password</Label>
                <div className="settings-group__controls">
                    <Button onClick={() => setIsPasswordModalOpen(true)}>Change Password</Button>
                </div>
            </div>
            <div className="settings-group">
                <Label>Delete Account</Label>
                <div className="settings-group__controls">
                    <Button onClick={handleDeleteAccount} variant="danger">
                        Delete This Account
                    </Button>
                </div>
            </div>

            {/* Edit Name Modal */}
            <Modal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                title="Edit Your Name"
            >
                <div className="form-group">
                    <Label htmlFor="new-name">New Name</Label>
                    <Input
                        id="new-name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                </div>
                <div className="modal-footer">
                    <Button onClick={() => setIsNameModalOpen(false)} variant="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleNameChange}>Save Name</Button>
                </div>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title="Change Your Password"
            >
                <p className="modal-description">
                    Enter a new password below. To remove your password, leave both fields blank.
                </p>
                <div className="form-group">
                    <Label htmlFor="new-password">New Password (min. 4 characters)</Label>
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
                    <Button onClick={() => setIsPasswordModalOpen(false)} variant="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handlePasswordChange}>Save Password</Button>
                </div>
            </Modal>
        </div>
    );
};

export default ProfileSection;
