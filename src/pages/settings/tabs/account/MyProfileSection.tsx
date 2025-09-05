// src/pages/settings/tabs/account/MyProfileSection.tsx

import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
// NEW: Import Languages icon
import { Languages } from 'lucide-react';

// --- CONTEXTS ---
import { AuthContext } from '../../../../contexts/AuthContext.tsx';
import { ModalContext } from '../../../../contexts/ModalContext.tsx';

// --- COMPONENTS ---
import Button from '../../../../components/common/Button.tsx';
import Input from '../../../../components/common/Form/Input.tsx';
import Label from '../../../../components/common/Form/Label.tsx';
// NEW: Import Select component
import Select from '../../../../components/common/Form/Select.tsx';

/**
 * A component for the current user to manage their own profile information.
 */
const MyProfileSection: React.FC = () => {
    const { t } = useTranslation();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    if (!auth || !modal) {
        throw new Error('This component must be used within all required providers.');
    }

    // NEW: Destructure appSettings to determine language fallback.
    const { currentUser, updateUser, deleteUser, appSettings } = auth;

    if (!currentUser) {
        return null;
    }

    // --- EVENT HANDLERS ---

    // NEW: Handler for the language dropdown.
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = e.target.value as 'en' | 'de';
        updateUser(currentUser.id!, { language: newLanguage });
    };

    // --- MODAL HANDLERS ---

    const showEditNameModal = () => {
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
                    modal.hideModal();
                } catch (error) {
                    console.error('Failed to update name:', error);
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

        modal.showModal({
            title: t('settings.myProfile.editNameModalTitle'),
            content: <EditNameForm />,
        });
    };

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

    const handleDeleteAccount = () => {
        modal.showConfirm({
            title: t('confirmations.deleteSelf.title'),
            message: t('confirmations.deleteSelf.message'),
            onConfirm: async () => {
                try {
                    await deleteUser(currentUser.id!);
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
                    <Button variant="secondary" onClick={showEditNameModal}>
                        {t('buttons.editName')}
                    </Button>
                </div>
            </div>

            {/* NEW: Language Setting */}
            <div className="settings-group">
                <Label as="h4">
                    <Languages size={16} /> {t('labels.language')}
                </Label>
                <div className="settings-group__controls">
                    <Select
                        value={currentUser.language || appSettings?.defaultLanguage || 'en'}
                        onChange={handleLanguageChange}
                        aria-label={t('labels.language')}
                    >
                        <option value="en">{t('languages.en')}</option>
                        <option value="de">{t('languages.de')}</option>
                    </Select>
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
