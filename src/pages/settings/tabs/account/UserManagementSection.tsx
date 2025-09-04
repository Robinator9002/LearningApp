// src/pages/settings/tabs/account/UserManagementSection.tsx

import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

// --- CONTEXTS ---
import { AuthContext } from '../../../../contexts/AuthContext';
import { ModalContext } from '../../../../contexts/ModalContext';

// --- TYPES ---
import type { IUser } from '../../../../types/database';

// --- COMPONENTS ---
import Button from '../../../../components/common/Button.tsx';
import Input from '../../../../components/common/Form/Input';
import Label from '../../../../components/common/Form/Label';
import Select from '../../../../components/common/Form/Select';

/**
 * An admin-only component for managing all user accounts.
 * This component has been refactored to be "dumb," relying entirely on the
 * AuthContext for data and CRUD operations, and the ModalContext for UI dialogs.
 */
const UserManagementSection: React.FC = () => {
    // --- HOOKS & CONTEXTS ---
    const { t } = useTranslation();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    // Critical context guards.
    if (!auth || !modal) {
        throw new Error('This component must be used within all required providers.');
    }

    const { users, createUser, updateUser, deleteUser, currentUser } = auth;

    // Filter out the current admin from the list to prevent self-modification here.
    const otherUsers = users.filter((u) => u.id !== currentUser?.id);

    // --- MODAL HANDLERS ---

    /**
     * Opens a modal to create a new user account.
     * The form logic is encapsulated within a small, local component.
     */
    const showCreateUserModal = () => {
        const CreateUserForm = () => {
            const [name, setName] = useState('');
            const [type, setType] = useState<'learner' | 'admin'>('learner');

            const handleSave = async () => {
                if (!name.trim()) {
                    return modal.showAlert({
                        title: t('errors.validation.title'),
                        message: t('errors.validation.nameMissing'),
                    });
                }
                try {
                    await createUser({ name: name.trim(), type });
                    modal.hideModal();
                } catch (error) {
                    console.error('Failed to create user:', error);
                    modal.showAlert({
                        title: t('errors.title'),
                        message: t('errors.userExists'),
                    });
                }
            };

            return (
                <>
                    <div className="form-group">
                        <Label htmlFor="new-user-name">{t('labels.name')}</Label>
                        <Input
                            id="new-user-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <Label htmlFor="new-user-type">{t('labels.accountType')}</Label>
                        <Select
                            id="new-user-type"
                            value={type}
                            onChange={(e) => setType(e.target.value as typeof type)}
                        >
                            <option value="learner">{t('roles.learner')}</option>
                            <option value="admin">{t('roles.admin')}</option>
                        </Select>
                    </div>
                    <div className="modal-footer">
                        <Button variant="secondary" onClick={modal.hideModal}>
                            {t('buttons.cancel')}
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            {t('buttons.createAccount')}
                        </Button>
                    </div>
                </>
            );
        };

        modal.showModal({
            title: t('settings.manageAccounts.createModalTitle'),
            content: <CreateUserForm />,
        });
    };

    /**
     * Opens a modal to edit an existing user's account details.
     * @param userToEdit - The full user object to be edited.
     */
    const showEditUserModal = (userToEdit: IUser) => {
        const EditUserForm = () => {
            const [name, setName] = useState(userToEdit.name);
            const [type, setType] = useState(userToEdit.type);

            const handleSave = async () => {
                if (!name.trim()) {
                    return modal.showAlert({
                        title: t('errors.validation.title'),
                        message: t('errors.validation.nameMissing'),
                    });
                }
                try {
                    await updateUser(userToEdit.id!, { name: name.trim(), type });
                    modal.hideModal();
                } catch (error) {
                    console.error('Failed to update user:', error);
                    modal.showAlert({
                        title: t('errors.title'),
                        message: t('errors.userExists'),
                    });
                }
            };

            return (
                <>
                    <div className="form-group">
                        <Label htmlFor="edit-user-name">{t('labels.name')}</Label>
                        <Input
                            id="edit-user-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <Label htmlFor="edit-user-type">{t('labels.accountType')}</Label>
                        <Select
                            id="edit-user-type"
                            value={type}
                            onChange={(e) => setType(e.target.value as typeof type)}
                        >
                            <option value="learner">{t('roles.learner')}</option>
                            <option value="admin">{t('roles.admin')}</option>
                        </Select>
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
            title: t('settings.manageAccounts.editModalTitle', { name: userToEdit.name }),
            content: <EditUserForm />,
        });
    };

    /**
     * Shows a confirmation dialog before deleting a user account.
     * @param userToDelete - The full user object to be deleted.
     */
    const handleDeleteUser = (userToDelete: IUser) => {
        modal.showConfirm({
            title: t('confirmations.deleteUser.title', { name: userToDelete.name }),
            message: t('confirmations.deleteUser.message'),
            onConfirm: async () => {
                try {
                    await deleteUser(userToDelete.id!);
                } catch (error) {
                    console.error('Failed to delete user:', error);
                    modal.showAlert({
                        title: t('errors.title'),
                        message: t('errors.deleteUserFailed'),
                    });
                }
            },
        });
    };

    // --- RENDER ---
    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <h3 className="settings-section__title">{t('settings.manageAccounts.title')}</h3>
                <Button variant="primary" onClick={showCreateUserModal}>
                    {t('buttons.createNewAccount')}
                </Button>
            </div>
            <div className="user-list">
                {otherUsers && otherUsers.length > 0 ? (
                    otherUsers.map((user) => (
                        <div key={user.id} className="user-list-item">
                            <span className="user-list-item__name">{user.name}</span>
                            <span className="user-list-item__type">{t(`roles.${user.type}`)}</span>
                            <div className="user-list-item__actions">
                                <Button variant="secondary" onClick={() => showEditUserModal(user)}>
                                    {t('buttons.edit')}
                                </Button>
                                <Button variant="danger" onClick={() => handleDeleteUser(user)}>
                                    {t('buttons.delete')}
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>{t('settings.manageAccounts.noLearners')}</p>
                )}
            </div>
        </div>
    );
};

export default UserManagementSection;
