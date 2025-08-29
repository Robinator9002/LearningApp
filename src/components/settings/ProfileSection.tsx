// src/components/settings/ProfileSection.tsx

import React, { useState, useContext } from 'react';
import type { IUser } from '../../types/database';
import { db } from '../../lib/db';
import { AuthContext } from '../../contexts/AuthContext';
import { ModalContext } from '../../contexts/ModalContext';

import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';
import Input from '../common/Form/Input/Input';
import Label from '../common/Form/Label/Label';

interface ProfileSectionProps {
    currentUser: IUser;
}

/**
 * ProfileSection displays the current user's profile information
 * and provides the functionality to edit their name via a modal.
 */
const ProfileSection: React.FC<ProfileSectionProps> = ({ currentUser }) => {
    // State for controlling the edit modal's visibility
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State for the name input field within the modal
    const [newName, setNewName] = useState(currentUser.name);

    // Access contexts for authentication and showing alerts
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    // Ensure contexts are available
    if (!auth || !modal) {
        throw new Error('This component must be used within AuthProvider and ModalProvider.');
    }

    /**
     * Handles the logic for saving the updated user name.
     */
    const handleSaveChanges = async () => {
        // 1. Validate the input
        const trimmedName = newName.trim();
        if (!trimmedName) {
            modal.showAlert({ title: 'Invalid Input', message: 'Name cannot be empty.' });
            return;
        }

        // Prevent saving if the name hasn't changed
        if (trimmedName === currentUser.name) {
            setIsModalOpen(false);
            return;
        }

        try {
            // 2. Update the name in the database
            await db.users.update(currentUser.id!, { name: trimmedName });

            // 3. Update the name in the global auth state to reflect immediately
            const updatedUser = { ...currentUser, name: trimmedName };
            auth.login(updatedUser);

            // 4. Close the modal
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to update user name:', error);
            modal.showAlert({
                title: 'Update Error',
                message: 'Could not save the new name. It might already be in use.',
            });
        }
    };

    return (
        <>
            <section className="settings-section">
                <h3 className="settings-section__title">My Profile</h3>
                <div className="settings-section__content">
                    <div className="profile-info">
                        <span className="profile-info__label">Name:</span>
                        <span className="profile-info__value">{currentUser.name}</span>
                    </div>
                    {/* This button now opens the edit modal */}
                    <Button onClick={() => setIsModalOpen(true)}>Edit Name</Button>
                </div>
            </section>

            {/* The Edit Profile Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit Your Name"
            >
                <div className="form-group">
                    <Label htmlFor="edit-user-name">New Name</Label>
                    <Input
                        id="edit-user-name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="modal-footer">
                    <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default ProfileSection;
