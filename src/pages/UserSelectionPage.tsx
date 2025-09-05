// src/pages/UserSelectionPage.tsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Shield, CheckCircle } from 'lucide-react';

// --- STYLES ---
// NEW: Import the dedicated stylesheet for this page.
import '../styles/pages/user-selection-page.css';

// --- CONTEXTS ---
import { AuthContext } from '../contexts/AuthContext';
import { ModalContext } from '../contexts/ModalContext';

// --- TYPES ---
import type { IUser, IAppSettings } from '../types/database';

// --- COMPONENTS ---
import Button from '../components/common/Button';
import Input from '../components/common/Form/Input';
import Label from '../components/common/Form/Label';
import Select from '../components/common/Form/Select';

// --- UTILITIES ---
import { seedInitialCourses } from '../lib/courseUtils';

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

const FirstAdminSetup: React.FC = () => {
    const { t } = useTranslation();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    const [adminName, setAdminName] = useState('');
    const [password, setPassword] = useState('');
    const [adminLanguage, setAdminLanguage] = useState<'en' | 'de'>('en');
    const [appLanguage, setAppLanguage] = useState<'en' | 'de'>('en');
    const [shouldSeedCourses, setShouldSeedCourses] = useState(true);
    const [isComplete, setIsComplete] = useState(false);

    if (!auth || !modal) throw new Error('Contexts not available');
    const { createUser, updateAppSettings, login } = auth;

    const handleSetup = async () => {
        if (!adminName.trim()) {
            return modal.showAlert({
                title: t('errors.validation.title'),
                message: t('errors.validation.nameMissing'),
            });
        }

        try {
            const newAdmin: Omit<IUser, 'id'> = {
                name: adminName.trim(),
                type: 'admin',
                language: adminLanguage,
                ...(password && { password }),
            };
            await createUser(newAdmin);

            const appSettingsUpdate: Partial<IAppSettings> = {
                defaultLanguage: appLanguage,
                seedCoursesOnFirstRun: shouldSeedCourses,
            };
            await updateAppSettings(appSettingsUpdate);

            if (shouldSeedCourses) {
                await seedInitialCourses(appLanguage);
            }

            setIsComplete(true);

            setTimeout(async () => {
                // Find the user we just created to log them in.
                // This is safer than relying on array indices.
                const createdUser = await db.users.where('name').equals(adminName.trim()).first();
                if (createdUser) {
                    login(createdUser);
                }
            }, 2000);
        } catch (error) {
            console.error('First admin setup failed:', error);
            modal.showAlert({ title: t('errors.title'), message: t('errors.setupFailed') });
        }
    };

    if (isComplete) {
        return (
            <div className="first-run-success">
                <CheckCircle className="first-run-success__icon" size={64} />
                <h3 className="first-run-success__title">{t('setup.successTitle')}</h3>
                <p className="first-run-success__message">{t('setup.successMessage')}</p>
            </div>
        );
    }

    return (
        <div className="first-run-form">
            <div className="form-group">
                <Label htmlFor="admin-name">{t('setup.adminNameLabel')}</Label>
                <Input
                    id="admin-name"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                />
            </div>
            <div className="form-group">
                <Label htmlFor="admin-password">{t('labels.passwordOptional')}</Label>
                <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="form-group">
                <Label htmlFor="admin-language">{t('setup.yourLanguageLabel')}</Label>
                <Select
                    id="admin-language"
                    value={adminLanguage}
                    onChange={(e) => setAdminLanguage(e.target.value as 'en' | 'de')}
                >
                    <option value="en">{t('languages.en')}</option>
                    <option value="de">{t('languages.de')}</option>
                </Select>
            </div>
            <hr className="form-divider" />
            <div className="form-group">
                <Label htmlFor="app-language">{t('setup.defaultLanguageLabel')}</Label>
                <Select
                    id="app-language"
                    value={appLanguage}
                    onChange={(e) => setAppLanguage(e.target.value as 'en' | 'de')}
                >
                    <option value="en">{t('languages.en')}</option>
                    <option value="de">{t('languages.de')}</option>
                </Select>
                <p className="form-hint">{t('setup.defaultLanguageDescription')}</p>
            </div>
            <div className="form-group form-group--checkbox">
                <input
                    id="seed-courses"
                    type="checkbox"
                    checked={shouldSeedCourses}
                    onChange={(e) => setShouldSeedCourses(e.target.checked)}
                    className="form-checkbox"
                />
                <Label htmlFor="seed-courses" className="form-checkbox-label">
                    {t('setup.seedCoursesLabel')}
                </Label>
            </div>
             <p className="form-hint">{t('setup.seedCoursesDescription')}</p>

            <div className="modal-footer">
                <Button variant="primary" size="large" onClick={handleSetup}>
                    {t('buttons.completeSetup')}
                </Button>
            </div>
        </div>
    );
};

const UserSelectionPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    if (!auth || !modal) {
        throw new Error('AuthContext or ModalContext is not available');
    }
    const { users, login, createUser } = auth;

    if (!auth.isLoading && users.length === 0) {
        return (
            <div className="user-select">
                <div className="user-select__first-run">
                    <h2 className="user-select__title">{t('setup.title')}</h2>
                    <p className="user-select__subtitle">{t('setup.subtitle')}</p>
                    <FirstAdminSetup />
                </div>
            </div>
        );
    }

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
                // NOTE: In a real app, this would be a call to a secure auth endpoint.
                // For this local-only app, direct comparison is acceptable.
                if (password === user.password) {
                    modal.hideModal();
                    login(user);
                    navigate(user.type === 'admin' ? '/admin' : '/dashboard');
                } else {
                    modal.showAlert({
                        title: t('errors.loginFailed'),
                        message: t('errors.loginFailed'), // Re-using title for message for simplicity
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
        <div className="user-select">
            <div className="user-select__header">
                <h2 className="user-select__title">{t('userSelection.title')}</h2>
                {/* Admins can create users from their settings page.
                This button is for learners to create their own accounts. */}
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
        </div>
    );
};

export default UserSelectionPage;

