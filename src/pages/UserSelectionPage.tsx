// src/pages/UserSelectionPage.tsx

import React, { useState, useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Shield } from 'lucide-react';

import { db } from '../lib/db';
import { AuthContext } from '../contexts/AuthContext';
import { ModalContext } from '../contexts/ModalContext';
import type { IUser } from '../types/database';

// Reusable components
import Button from '../components/common/Button';
import Modal from '../components/common/Modal/Modal';
import Input from '../components/common/Form/Input';
import Label from '../components/common/Form/Label';
import Select from '../components/common/Form/Select';

// A simple presentational component for displaying a user profile card.
const UserCard: React.FC<{ user: IUser; onSelect: (user: IUser) => void }> = ({
    user,
    onSelect,
}) => (
    <div className="user-card" onClick={() => onSelect(user)}>
        <div className="user-card__icon">
            {user.type === 'admin' ? <Shield size={48} /> : <User size={48} />}
        </div>
        <span className="user-card__name">{user.name}</span>
    </div>
);

const UserSelectionPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    // --- State Management ---
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [password, setPassword] = useState('');
    const [newUserData, setNewUserData] = useState({ name: '', password: '', type: 'learner' });

    // --- Data Fetching ---
    const users = useLiveQuery(() => db.users.toArray(), []);
    const hasAdminAccount = useLiveQuery(
        async () => (await db.users.where('type').equals('admin').count()) > 0,
        [],
    );

    if (!auth || !modal) {
        throw new Error('AuthContext or ModalContext is not available');
    }

    // --- Event Handlers ---

    const handleUserSelect = (user: IUser) => {
        if (user.password) {
            setSelectedUser(user);
            setLoginModalOpen(true);
        } else {
            auth.login(user);
            navigate(user.type === 'admin' ? '/admin' : '/dashboard');
        }
    };

    const handleLogin = () => {
        if (selectedUser && password === selectedUser.password) {
            auth.login(selectedUser);
            navigate(selectedUser.type === 'admin' ? '/admin' : '/dashboard');
        } else {
            modal.showAlert({
                title: t('errors.loginFailed.title'),
                message: t('errors.loginFailed.message'),
            });
            setPassword('');
        }
    };

    const handleCreateUser = async () => {
        if (!newUserData.name.trim()) {
            modal.showAlert({
                title: t('errors.validation.title'),
                message: t('errors.validation.nameMissing'),
            });
            return;
        }

        try {
            const newUser: Omit<IUser, 'id'> = {
                name: newUserData.name.trim(),
                type: newUserData.type as IUser['type'],
                ...(newUserData.password && { password: newUserData.password }),
            };
            await db.users.add(newUser as IUser);
            setCreateModalOpen(false);
            setNewUserData({ name: '', password: '', type: 'learner' }); // Reset form
        } catch (error) {
            console.error('Failed to create user:', error);
            modal.showAlert({
                title: t('errors.createUserFailed.title'),
                message: t('errors.createUserFailed.message'),
            });
        }
    };

    // --- Render Logic ---

    if (!users || (users.length === 0 && !hasAdminAccount)) {
        return (
            <div className="user-select">
                <h2 className="user-select__title">{t('firstRun.title')}</h2>
                <p className="user-select__subtitle">{t('firstRun.description')}</p>
                <div className="user-select__first-run-form">
                    <Input
                        placeholder={t('placeholders.adminName')}
                        value={newUserData.name}
                        onChange={(e) =>
                            setNewUserData({ ...newUserData, name: e.target.value, type: 'admin' })
                        }
                    />
                    <Input
                        type="password"
                        placeholder={t('placeholders.optionalPassword')}
                        value={newUserData.password}
                        onChange={(e) =>
                            setNewUserData({ ...newUserData, password: e.target.value })
                        }
                    />
                    <Button variant="primary" onClick={handleCreateUser}>
                        {t('buttons.createAdminAccount')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="user-select">
                <h2 className="user-select__title">{t('userSelection.title')}</h2>

                <div className="user-select__content">
                    <div className="user-select__grid">
                        {users?.map((user) => (
                            <UserCard key={user.id} user={user} onSelect={handleUserSelect} />
                        ))}
                    </div>

                    <div className="user-select__actions">
                        <Button variant="secondary" onClick={() => setCreateModalOpen(true)}>
                            {t('buttons.createNewAccount')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Login Modal */}
            <Modal
                isOpen={isLoginModalOpen}
                onClose={() => {
                    setLoginModalOpen(false);
                    setPassword('');
                }}
                title={t('loginModal.title', { name: selectedUser?.name })}
            >
                <div className="form-group">
                    <Label htmlFor="password-input">{t('labels.password')}</Label>
                    <Input
                        id="password-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setLoginModalOpen(false)}>
                        {t('buttons.cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleLogin}>
                        {t('buttons.login')}
                    </Button>
                </div>
            </Modal>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title={t('createUserModal.title')}
            >
                <div className="form-group">
                    <Label htmlFor="new-name">{t('labels.name')}</Label>
                    <Input
                        id="new-name"
                        value={newUserData.name}
                        onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="new-password">{t('labels.passwordOptional')}</Label>
                    <Input
                        id="new-password"
                        type="password"
                        value={newUserData.password}
                        onChange={(e) =>
                            setNewUserData({ ...newUserData, password: e.target.value })
                        }
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="user-type">{t('labels.accountType')}</Label>
                    <Select
                        id="user-type"
                        value={newUserData.type}
                        onChange={(e) =>
                            setNewUserData({
                                ...newUserData,
                                type: e.target.value as IUser['type'],
                            })
                        }
                    >
                        <option value="learner">{t('userTypes.learner')}</option>
                        <option value="admin">{t('userTypes.admin')}</option>
                    </Select>
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
                        {t('buttons.cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleCreateUser}>
                        {t('buttons.create')}
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default UserSelectionPage;
