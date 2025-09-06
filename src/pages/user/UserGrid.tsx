// src/pages/user/UserGrid.tsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Shield } from 'lucide-react';

// --- CONTEXTS ---
// FIX: Corrected all import paths to be relative to the new subfolder.
import { AuthContext } from '../../contexts/AuthContext.tsx';
import { ModalContext } from '../../contexts/ModalContext.tsx';

// --- TYPES ---
import type { IUser } from '../../types/database.ts';

// --- COMPONENTS ---
import Button from '../../components/common/Button.tsx';
import Input from '../../components/common/Form/Input.tsx';
import Label from '../../components/common/Form/Label.tsx';
import Select from '../../components/common/Form/Select.tsx';

// --- SUB-COMPONENTS ---

const UserCard: React.FC<{ user: IUser; onSelect: (user: IUser) => void }> = ({
    user,
    onSelect,
}) => (
    <div className="user-card" onClick={() => onSelect(user)}>
        <div className="user-card__icon">
            {user.type === 'admin' ? <Shield size={32} /> : <User size={32} />}
        </div>
        <span className="user-card__name">{user.name}</span>
    </div>
);

/**
 * A component responsible for displaying the grid of existing users
 * and handling the login/creation flow for them.
 */
const UserGrid: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    if (!auth || !modal) {
        throw new Error('UserGrid must be used within Auth and Modal Providers');
    }
    const { users, login, createUser } = auth;

    const handleUserSelect = (user: IUser) => {
        if (user.password) {
            showLoginModal(user);
        } else {
            login(user);
            navigate(user.type === 'admin' ? '/admin' : '/dashboard');
        }
    };

    const showLoginModal = (user: IUser) => {
        const LoginForm = () => {
            const [password, setPassword] = useState('');
            const handleLogin = () => {
                if (password === user.password) {
                    modal.hideModal();
                    login(user);
                    navigate(user.type === 'admin' ? '/admin' : '/dashboard');
                } else {
                    modal.showAlert({
                        title: t('errors.loginFailed'),
                        message: t('errors.loginFailed'),
                    });
                    setPassword('');
                }
            };

            return (
                <>
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
                        <Button variant="secondary" onClick={modal.hideModal}>
                            {t('buttons.cancel')}
                        </Button>
                        <Button variant="primary" onClick={handleLogin}>
                            {t('buttons.login')}
                        </Button>
                    </div>
                </>
            );
        };
        modal.showModal({
            title: `${t('buttons.login')}: ${user.name}`,
            content: <LoginForm />,
        });
    };

    const showCreateUserModal = () => {
        const CreateUserForm = () => {
            const [name, setName] = useState('');
            const [language, setLanguage] = useState(auth.appSettings?.defaultLanguage || 'en');

            const handleSave = async () => {
                if (!name.trim()) {
                    return modal.showAlert({
                        title: t('errors.validation.title'),
                        message: t('errors.validation.nameMissing'),
                    });
                }
                try {
                    await createUser({ name: name.trim(), type: 'learner', language });
                    modal.hideModal();
                } catch (error) {
                    modal.showAlert({ title: t('errors.title'), message: t('errors.userExists') });
                }
            };
            return (
                <>
                    <div className="form-group">
                        <Label htmlFor="new-name">{t('labels.name')}</Label>
                        <Input
                            id="new-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <Label htmlFor="new-user-lang">{t('labels.language')}</Label>
                        <Select
                            id="new-user-lang"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'en' | 'de')}
                        >
                            <option value="en">{t('languages.en')}</option>
                            <option value="de">{t('languages.de')}</option>
                        </Select>
                    </div>
                    <div className="modal-footer">
                        <Button variant="secondary" onClick={modal.hideModal}>
                            {t('buttons.cancel')}
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            {t('buttons.create')}
                        </Button>
                    </div>
                </>
            );
        };
        modal.showModal({
            title: t('userSelection.createUserModalTitle'),
            content: <CreateUserForm />,
        });
    };

    return (
        <>
            <div className="user-select__header">
                <h2 className="user-select__title">{t('userSelection.title')}</h2>
                <Button variant="primary" onClick={showCreateUserModal}>
                    {t('buttons.createAccount')}
                </Button>
            </div>

            <div className="user-select__grid-wrapper">
                {['admin', 'learner'].map((userType) => {
                    const filteredUsers = users.filter((u) => u.type === userType);
                    if (filteredUsers.length === 0) return null;
                    return (
                        <div key={userType} className="user-select__group">
                            <h3 className="user-select__group-title">{t(`roles.${userType}`)}s</h3>
                            <div className="user-select__grid">
                                {filteredUsers.map((user) => (
                                    <UserCard
                                        key={user.id}
                                        user={user}
                                        onSelect={handleUserSelect}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default UserGrid;
