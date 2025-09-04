// src/pages/settings/tabs/account/UserManagementSection.tsx

import React, { useState, useContext, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next'; // MODIFICATION: Imported useTranslation

// FIX: Corrected all import paths for robustness.
import { db } from '../../../../lib/db';
import { ModalContext } from '../../../../contexts/ModalContext';
import type { IUser } from '../../../../types/database';
import Button from '../../../../components/common/Button';
import Modal from '../../../../components/common/Modal/Modal';
import Input from '../../../../components/common/Form/Input';
import Label from '../../../../components/common/Form/Label';
import Select from '../../../../components/common/Form/Select';

/**
 * A section visible only to admins for managing all user accounts.
 */
const UserManagementSection: React.FC = () => {
    const modal = useContext(ModalContext);
    const { t } = useTranslation(); // MODIFICATION: Initialized useTranslation

    // --- State for Modals & Forms ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<IUser | null>(null);
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
     * Handles creating a new user.
     */
    const handleCreateUser = async () => {
        if (!newUserName.trim()) {
            modal.showAlert({
                title: t('errors.validation.title'),
                message: t('errors.validation.nameMissing'),
            });
            return;
        }
        try {
            await db.users.add({ name: newUserName.trim(), type: newUserType });
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Failed to create user:', error);
            modal.showAlert({
                title: t('errors.title'),
                message: t('errors.createUserFailed'),
            });
        }
    };

    /**
     * Handles updating a learner's name.
     */
    const handleUpdateUser = async () => {
        if (!editingUser || !newUserName.trim()) {
            modal.showAlert({
                title: t('errors.validation.title'),
                message: t('errors.validation.nameMissing'),
            });
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
            modal.showAlert({ title: t('errors.title'), message: t('errors.updateUserFailed') });
        }
    };

    /**
     * Opens the edit modal and pre-populates it with data.
     */
    const openEditModal = (user: IUser) => {
        setEditingUser(user);
        setNewUserName(user.name);
        setNewUserType(user.type);
        setIsEditModalOpen(true);
    };

    /**
     * Handles deleting a learner account.
     */
    const handleDeleteUser = (userToDelete: IUser) => {
        modal.showConfirm({
            title: t('confirmations.deleteUser.title', { name: userToDelete.name }),
            message: t('confirmations.deleteUser.message'),
            onConfirm: async () => {
                try {
                    await db.transaction('rw', db.users, db.progressLogs, async () => {
                        await db.users.delete(userToDelete.id!);
                        await db.progressLogs.where('userId').equals(userToDelete.id!).delete();
                    });
                } catch (error) {
                    console.error('Failed to delete user and their progress:', error);
                    modal.showAlert({
                        title: t('errors.title'),
                        message: t('errors.deleteUserFailed'),
                    });
                }
            },
        });
    };

    return (
        <div className="settings-section">
            <div className="settings-section__header">
                <h3 className="settings-section__title">{t('settings.manageAccounts.title')}</h3>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    {t('buttons.createNewAccount')}
                </Button>
            </div>
            <div className="user-list">
                {learners && learners.length > 0 ? (
                    learners.map((user) => (
                        <div key={user.id} className="user-list-item">
                            <span className="user-list-item__name">{user.name}</span>
                            <div className="user-list-item__actions">
                                <Button variant="secondary" onClick={() => openEditModal(user)}>
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

            {/* --- Modals --- */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={t('settings.manageAccounts.createModalTitle')}
            >
                <div className="form-group">
                    <Label htmlFor="new-user-name">{t('labels.name')}</Label>
                    <Input
                        id="new-user-name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="new-user-type">{t('labels.accountType')}</Label>
                    <Select
                        id="new-user-type"
                        value={newUserType}
                        onChange={(e) => setNewUserType(e.target.value as typeof newUserType)}
                    >
                        <option value="learner">{t('userTypes.learner')}</option>
                        <option value="admin">{t('userTypes.admin')}</option>
                    </Select>
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                        {t('buttons.cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleCreateUser}>
                        {t('buttons.createAccount')}
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={t('settings.manageAccounts.editModalTitle', { name: editingUser?.name })}
            >
                <div className="form-group">
                    <Label htmlFor="edit-user-name">{t('labels.name')}</Label>
                    <Input
                        id="edit-user-name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="edit-user-type">{t('labels.accountType')}</Label>
                    <Select
                        id="edit-user-type"
                        value={newUserType}
                        onChange={(e) => setNewUserType(e.target.value as typeof newUserType)}
                    >
                        <option value="learner">{t('userTypes.learner')}</option>
                        <option value="admin">{t('userTypes.admin')}</option>
                    </Select>
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                        {t('buttons.cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleUpdateUser}>
                        {t('buttons.saveChanges')}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagementSection;
