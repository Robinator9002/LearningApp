// src/pages/settings/tabs/account/MyProfileSection.tsx

import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

// --- CONTEXTS ---
import { AuthContext } from '../../../../contexts/AuthContext';
import { ModalContext } from '../../../../contexts/ModalContext';

// --- COMPONENTS ---
import Button from '../../../../components/common/Button.tsx';
import Input from '../../../../components/common/Form/Input';
import Label from '../../../../components/common/Form/Label';

/**
 * A component for the current user to manage their own profile information.
 * This component is now a "dumb" component. It reads data and functions from
 * contexts and does not manage its own complex state or perform direct database calls.
 */
const MyProfileSection: React.FC = () => {
    // --- HOOKS & CONTEXTS ---
    const { t } = useTranslation();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    // This is a critical guard to ensure the component doesn't render
    // in a broken state if the contexts are not available.
    if (!auth || !modal) {
        throw new Error('This component must be used within all required providers.');
    }

    const { currentUser, updateUser, deleteUser } = auth;

    // We can't render anything if there's no user. The parent component
    // should ideally handle this, but this is a safe fallback.
    if (!currentUser) {
        return null;
    }

    // --- MODAL HANDLERS ---

    /**
     * Opens a modal to edit the user's name.
     * The modal's content, a small form, is defined directly here and passed
     * to the generic ModalContext, which handles the rendering.
     */
    const showEditNameModal = () => {
        // A small, self-contained component for the modal's content.
        const EditNameForm = () => {
            const [name, setName] = useState(currentUser.name);

            const handleSave = async () => {
                if (!name.trim()) {
                    modal.showAlert({
                        title: t('errors.validation.title'),
                        message: t('errors.validation.nameMissing'),
                    });
                    return;
                }
                try {
                    await updateUser(currentUser.id!, { name: name.trim() });
                    modal.hideModal(); // Close this modal on success
                } catch (error) {
                    console.error('Failed to update name:', error);
                    // Show a new alert modal on top of the current one for the error.
                    modal.showAlert({
                        title: t('errors.title'),
                        message: t('errors.userExists'),
                    });
                }
            };

            return (
                <>
                    <div className="form-group">
                        <Label htmlFor="edit-name">{t('labels.newName')}</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="modal-footer">
                        <Button variant="secondary" onClick={modal.hideModal}>
                            {t('buttons.cancel')}
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            {t('buttons.saveChanges')}
                        </Button>
                    </div>
                </>
            );
        };

        // Use the context to show our custom form.
        modal.showModal({
            title: t('settings.myProfile.editNameModalTitle'),
            content: <EditNameForm />,
        });
    };

    /**
     * Opens a modal to change or set the user's password.
     * Similar to the name modal, it uses a small, self-contained form component.
     */
    const showChangePasswordModal = () => {
        const ChangePasswordForm = () => {
            const [newPassword, setNewPassword] = useState('');
            const [confirmPassword, setConfirmPassword] = useState('');

            const handleSave = async () => {
                if (newPassword !== confirmPassword) {
                    modal.showAlert({
                        title: t('errors.validation.title'),
                        message: t('errors.validation.passwordsDontMatch'),
                    });
                    return;
                }

                try {
                    const passwordToSet =
                        newPassword.trim() === '' ? undefined : newPassword.trim();
                    await updateUser(currentUser.id!, { password: passwordToSet });
                    modal.hideModal();
                } catch (error) {
                    console.error('Failed to update password:', error);
                    modal.showAlert({
                        title: t('errors.title'),
                        message: t('errors.passwordUpdateFailed'),
                    });
                }
            };

            return (
                <>
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
                        <Button variant="secondary" onClick={modal.hideModal}>
                            {t('buttons.cancel')}
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            {t('buttons.savePassword')}
                        </Button>
                    </div>
                </>
            );
        };

        modal.showModal({
            title: currentUser.password
                ? t('settings.myProfile.changePasswordModalTitle')
                : t('settings.myProfile.setPasswordModalTitle'),
            content: <ChangePasswordForm />,
        });
    };

    /**
     * Shows a confirmation dialog before deleting the user's account.
     * The logic is now handled entirely by the AuthContext after confirmation.
     */
    const handleDeleteAccount = () => {
        modal.showConfirm({
            title: t('confirmations.deleteSelf.title'),
            message: t('confirmations.deleteSelf.message'),
            onConfirm: async () => {
                try {
                    await deleteUser(currentUser.id!);
                    // The logout and navigation will be handled by the AuthContext's
                    // deleteUser function if the current user is deleted.
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

    // --- RENDER ---
    return (
        <div className="settings-section">
            <h3 className="settings-section__title">{t('settings.myProfile.title')}</h3>

            <div className="settings-group">
                <Label as="h4">{t('labels.name')}</Label>
                <div className="settings-group__controls settings-group__controls--inline">
                    <span className="settings-group__text-value">{currentUser.name}</span>
                    <Button variant="secondary" onClick={showEditNameModal}>
                        {t('buttons.editName')}
                    </Button>
                </div>
            </div>

            <div className="settings-group">
                <Label as="h4">{t('labels.password')}</Label>
                <div className="settings-group__controls">
                    <Button variant="secondary" onClick={showChangePasswordModal}>
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
        </div>
    );
};

export default MyProfileSection;
