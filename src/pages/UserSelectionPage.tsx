// src/pages/UserSelectionPage.tsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Shield, CheckCircle } from 'lucide-react';

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
// NOTE: We will create this utility in a later step, but we are designing
// our component to use it now, following the "plan-first" methodology.
import { seedInitialCourses } from '../lib/courseUtils';

// --- SUB-COMPONENTS ---

/**
 * A simple, presentational component for displaying a user profile card.
 */
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

/**
 * The dedicated modal content for the one-time initial setup of the application.
 */
const FirstAdminSetup: React.FC = () => {
    // --- HOOKS & CONTEXTS ---
    const { t } = useTranslation();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    // --- STATE MANAGEMENT ---
    const [adminName, setAdminName] = useState('');
    const [password, setPassword] = useState('');
    const [adminLanguage, setAdminLanguage] = useState<'en' | 'de'>('en');
    const [appLanguage, setAppLanguage] = useState<'en' | 'de'>('en');
    const [shouldSeedCourses, setShouldSeedCourses] = useState(true);
    const [isComplete, setIsComplete] = useState(false);

    if (!auth || !modal) throw new Error('Contexts not available');
    const { createUser, updateAppSettings, login } = auth;

    /**
     * The core logic for setting up the application. This function is atomic.
     */
    const handleSetup = async () => {
        if (!adminName.trim()) {
            return modal.showAlert({
                title: t('errors.validation.title'),
                message: t('errors.validation.nameMissing'),
            });
        }

        try {
            // 1. Create the admin user.
            const newAdmin: Omit<IUser, 'id'> = {
                name: adminName.trim(),
                type: 'admin',
                language: adminLanguage,
                ...(password && { password }),
            };
            await createUser(newAdmin);

            // 2. Update the global app settings.
            const appSettingsUpdate: Partial<IAppSettings> = {
                defaultLanguage: appLanguage,
                seedCoursesOnNewUser: shouldSeedCourses,
            };
            await updateAppSettings(appSettingsUpdate);

            // 3. Seed courses if requested.
            if (shouldSeedCourses) {
                await seedInitialCourses(appLanguage);
            }

            // 4. Mark setup as complete and show success message.
            setIsComplete(true);

            // 5. Automatically log in the new admin after a short delay.
            setTimeout(async () => {
                const createdUser = await auth.users.find((u) => u.name === adminName.trim());
                if (createdUser) {
                    login(createdUser);
                }
            }, 2000);
        } catch (error) {
            console.error('First admin setup failed:', error);
            modal.showAlert({ title: t('errors.title'), message: t('errors.setupFailed') });
        }
    };

    // Render a success screen after setup is complete.
    if (isComplete) {
        return (
            <div className="first-run-success">
                <CheckCircle className="first-run-success__icon" size={64} />
                <h3 className="first-run-success__title">{t('firstRun.successTitle')}</h3>
                <p className="first-run-success__message">{t('firstRun.successMessage')}</p>
            </div>
        );
    }

    // Render the setup form.
    return (
        <div className="first-run-form">
            <div className="form-group">
                <Label htmlFor="admin-name">{t('firstRun.adminNameLabel')}</Label>
                <Input
                    id="admin-name"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder={t('placeholders.adminName')}
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
                <Label htmlFor="admin-language">{t('firstRun.yourLanguageLabel')}</Label>
                <Select
                    id="admin-language"
                    value={adminLanguage}
                    onChange={(e) => setAdminLanguage(e.target.value as 'en' | 'de')}
                >
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                </Select>
            </div>
            <hr className="form-divider" />
            <div className="form-group">
                <Label htmlFor="app-language">{t('firstRun.defaultLanguageLabel')}</Label>
                <Select
                    id="app-language"
                    value={appLanguage}
                    onChange={(e) => setAppLanguage(e.target.value as 'en' | 'de')}
                >
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                </Select>
            </div>
            <div className="form-group form-group--checkbox">
                <input
                    id="seed-courses"
                    type="checkbox"
                    checked={shouldSeedCourses}
                    onChange={(e) => setShouldSeedCourses(e.target.checked)}
                />
                <Label htmlFor="seed-courses">{t('firstRun.seedCoursesLabel')}</Label>
            </div>

            <div className="modal-footer">
                <Button variant="primary" size="large" onClick={handleSetup}>
                    {t('buttons.completeSetup')}
                </Button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const UserSelectionPage: React.FC = () => {
    // --- HOOKS & CONTEXTS ---
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    if (!auth || !modal) {
        throw new Error('AuthContext or ModalContext is not available');
    }
    const { users, login, createUser } = auth;

    // --- STATE ---
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

    // --- "FIRST RUN" SCENARIO ---
    // If the users array is empty after loading, it's a first run.
    if (!auth.isLoading && users.length === 0) {
        return (
            <div className="user-select">
                <div className="user-select__first-run">
                    <h2 className="user-select__title">{t('firstRun.title')}</h2>
                    <p className="user-select__subtitle">{t('firstRun.description')}</p>
                    <FirstAdminSetup />
                </div>
            </div>
        );
    }

    // --- NORMAL OPERATION ---

    /**
     * Handles selecting a user from the grid.
     * If the user has a password, it opens the login modal.
     * Otherwise, it logs them in directly.
     * @param user - The user object that was clicked.
     */
    const handleUserSelect = (user: IUser) => {
        if (user.password) {
            setSelectedUser(user);
            showLoginModal(user);
        } else {
            login(user);
            navigate(user.type === 'admin' ? '/admin' : '/dashboard');
        }
    };

    /**
     * Displays a modal for entering a user's password.
     * @param user - The user attempting to log in.
     */
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
                        title: t('errors.loginFailed.title'),
                        message: t('errors.loginFailed.message'),
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
            title: t('loginModal.title', { name: user.name }),
            content: <LoginForm />,
        });
    };

    /**
     * Opens a modal to create a new (non-admin) user.
     */
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
                            <option value="en">English</option>
                            <option value="de">Deutsch</option>
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
            title: t('createUserModal.title'),
            content: <CreateUserForm />,
        });
    };

    return (
        <div className="user-select">
            <div className="user-select__header">
                <h2 className="user-select__title">{t('userSelection.title')}</h2>
                <Button variant="primary" onClick={showCreateUserModal}>
                    {t('buttons.createNewAccount')}
                </Button>
            </div>

            <div className="user-select__grid-wrapper">
                {['admin', 'learner'].map((userType) => {
                    const filteredUsers = users.filter((u) => u.type === userType);
                    if (filteredUsers.length === 0) return null;
                    return (
                        <div key={userType} className="user-select__group">
                            <h3 className="user-select__group-title">{t(`roles.${userType}`)}</h3>
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
