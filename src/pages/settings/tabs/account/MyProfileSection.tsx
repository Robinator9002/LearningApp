// src/pages/settings/tabs/account/MyProfileSection.tsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation

// FIX: Corrected all import paths for robustness.
import { db } from '../../../../lib/db';
import { AuthContext } from '../../../../contexts/AuthContext';
import { ModalContext } from '../../../../contexts/ModalContext';
import Button from '../../../../components/common/Button/Button';
import Modal from '../../../../components/common/Modal/Modal';
import Input from '../../../../components/common/Form/Input';
import Label from '../../../../components/common/Form/Label';

/**
 * A dedicated section for the current user to manage their own profile.
 */
const MyProfileSection: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);
    const currentUser = auth?.currentUser;

    // --- State for Modals & Forms ---
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newName, setNewName] = useState(currentUser?.name || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!auth || !modal || !currentUser) {
        throw new Error('This component must be used within all required providers.');
    }

    /**
     * Handles updating the user's name.
     */
    const handleNameChange = async () => {
        if (!newName.trim()) {
            modal.showAlert({
                title: t('errors.validation.title'),
                message: t('errors.validation.nameMissing'),
            });
            return;
        }
        try {
            await db.users.update(currentUser.id!, { name: newName.trim() });
            auth.login({ ...currentUser, name: newName.trim() });
            modal.showAlert({
                title: t('success.title'),
                message: t('success.nameUpdated'),
            });
            setIsNameModalOpen(false);
        } catch (error) {
            console.error('Failed to update name:', error);
            modal.showAlert({ title: t('errors.title'), message: t('errors.nameUpdateFailed') });
        }
    };

    /**
     * Handles setting, changing, or removing a user's password.
     */
    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            modal.showAlert({
                title: t('errors.validation.title'),
                message: t('errors.validation.passwordsDontMatch'),
            });
            return;
        }
        try {
            const passwordToSet = newPassword.trim() === '' ? undefined : newPassword.trim();
            await db.users.update(currentUser.id!, { password: passwordToSet });
            auth.login({ ...currentUser, password: passwordToSet });
            modal.showAlert({
                title: t('success.title'),
                message: t('success.passwordUpdated'),
            });
            setIsPasswordModalOpen(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Failed to update password:', error);
            modal.showAlert({
                title: t('errors.title'),
                message: t('errors.passwordUpdateFailed'),
            });
        }
    };

    /**
     * Handles deleting the user's own account.
     */
    const handleDeleteAccount = () => {
        modal.showConfirm({
            title: t('confirmations.deleteSelf.title'),
            message: t('confirmations.deleteSelf.message'),
            onConfirm: async () => {
                try {
                    await db.users.delete(currentUser.id!);
                    auth.logout();
                    navigate('/');
                } catch (error) {
                    console.error('Failed to delete account:', error);
                    modal.showAlert({
                        title: t('errors.title'),
                        message: t('errors.deleteAccountFailed'),
                    });
                }
            },
        });
    };

    return (
        <div className="settings-section">
            <h3 className="settings-section__title">{t('settings.myProfile.title')}</h3>

            <div className="settings-group">
                <Label as="h4">{t('labels.name')}</Label>
                <div className="settings-group__controls settings-group__controls--inline">
                    <span className="settings-group__text-value">{currentUser.name}</span>
                    <Button variant="secondary" onClick={() => setIsNameModalOpen(true)}>
                        {t('buttons.editName')}
                    </Button>
                </div>
            </div>

            <div className="settings-group">
                <Label as="h4">{t('labels.password')}</Label>
                <div className="settings-group__controls">
                    <Button variant="secondary" onClick={() => setIsPasswordModalOpen(true)}>
                        {currentUser.password
                            ? t('buttons.changePassword')
                            : t('buttons.setPassword')}
                    </Button>
                </div>
            </div>

            <div className="settings-group">
                <Label as="h4">{t('settings.myProfile.deleteAccount')}</Label>
                <div className="settings-group__controls">
                    <Button variant="danger" onClick={handleDeleteAccount}>
                        {t('buttons.deleteMyAccount')}
                    </Button>
                </div>
            </div>

            {/* --- Modals --- */}
            <Modal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                title={t('settings.myProfile.editNameModalTitle')}
            >
                <div className="form-group">
                    <Label htmlFor="edit-name">{t('labels.newName')}</Label>
                    <Input
                        id="edit-name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setIsNameModalOpen(false)}>
                        {t('buttons.cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleNameChange}>
                        {t('buttons.saveChanges')}
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title={
                    currentUser.password
                        ? t('settings.myProfile.changePasswordModalTitle')
                        : t('settings.myProfile.setPasswordModalTitle')
                }
            >
                <p className="modal-description">
                    {t('settings.myProfile.passwordModalDescription')}
                </p>
                <div className="form-group">
                    <Label htmlFor="new-password">{t('labels.newPassword')}</Label>
                    <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="confirm-password">{t('labels.confirmNewPassword')}</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>
                        {t('buttons.cancel')}
                    </Button>
                    <Button variant="primary" onClick={handlePasswordChange}>
                        {t('buttons.savePassword')}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default MyProfileSection;
