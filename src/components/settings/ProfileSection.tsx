// src/components/settings/ProfileSection.tsx

import React from 'react';
import type { IUser } from '../../types/database';
import Button from '../common/Button/Button';

// Define the props for the ProfileSection component.
// It needs the currently logged-in user to display their information.
interface ProfileSectionProps {
    currentUser: IUser;
}

/**
 * ProfileSection is a component within the Settings page that displays
 * the current user's profile information and provides an entry point
 * for editing that information.
 */
const ProfileSection: React.FC<ProfileSectionProps> = ({ currentUser }) => {
    // This handler will eventually open a modal to edit the user's name.
    // For now, it's a placeholder.
    const handleEditProfile = () => {
        console.log('TODO: Implement profile editing modal.');
    };

    return (
        <section className="settings-section">
            <h3 className="settings-section__title">My Profile</h3>
            <div className="settings-section__content">
                <div className="profile-info">
                    <span className="profile-info__label">Name:</span>
                    <span className="profile-info__value">{currentUser.name}</span>
                </div>
                <Button onClick={handleEditProfile}>Edit Name</Button>
            </div>
        </section>
    );
};

export default ProfileSection;
