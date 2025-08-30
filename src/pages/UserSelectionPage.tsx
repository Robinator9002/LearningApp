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
import Button from '../components/common/Button/Button';
import Modal from '../components/common/Modal/Modal';
import Input from '../components/common/Form/Input/Input';
import Label from '../components/common/Form/Label/Label';
import Select from '../components/common/Form/Select/Select';

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

    // Handles logic for when a user card is clicked
    const handleUserSelect = (user: IUser) => {
        if (user.password) {
            setSelectedUser(user);
            setLoginModalOpen(true);
        } else {
            auth.login(user);
            navigate(user.type === 'admin' ? '/admin' : '/dashboard');
        }
    };

    // Handles the final login attempt from the password modal
    const handleLogin = () => {
        if (selectedUser && password === selectedUser.password) {
            auth.login(selectedUser);
            navigate(selectedUser.type === 'admin' ? '/admin' : '/dashboard');
        } else {
            modal.showAlert({ title: 'Login Failed', message: 'Incorrect password.' });
            setPassword('');
        }
    };

    // Handles the creation of a new user from the creation modal
    const handleCreateUser = async () => {
        if (!newUserData.name.trim()) {
            modal.showAlert({ title: 'Validation Error', message: 'Please enter a name.' });
            return;
        }

        try {
            const newUser: Omit<IUser, 'id'> = {
                name: newUserData.name.trim(),
                type: newUserData.type as IUser['type'],
                // Only set password if one was provided
                ...(newUserData.password && { password: newUserData.password }),
            };
            await db.users.add(newUser as IUser);
            setCreateModalOpen(false);
            setNewUserData({ name: '', password: '', type: 'learner' }); // Reset form
        } catch (error) {
            console.error('Failed to create user:', error);
            modal.showAlert({
                title: 'Creation Failed',
                message: 'This name may already be in use.',
            });
        }
    };

    // --- Render Logic ---

    // The initial state when the database is empty
    if (!users || (users.length === 0 && !hasAdminAccount)) {
        return (
            <div className="user-select">
                <h2 className="user-select__title">Welcome!</h2>
                <p className="user-select__subtitle">
                    Let's create the first Admin account to get started.
                </p>
                <div className="user-select__first-run-form">
                    <Input
                        placeholder="Admin Name"
                        value={newUserData.name}
                        onChange={(e) =>
                            setNewUserData({ ...newUserData, name: e.target.value, type: 'admin' })
                        }
                    />
                    <Input
                        type="password"
                        placeholder="Optional Password"
                        value={newUserData.password}
                        onChange={(e) =>
                            setNewUserData({ ...newUserData, password: e.target.value })
                        }
                    />
                    <Button variant="primary" onClick={handleCreateUser}>
                        Create Admin Account
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="user-select">
                <h2 className="user-select__title">{t('userSelection.title')}</h2>

                {/* Grid for existing user profiles */}
                <div className="user-select__grid">
                    {users?.map((user) => (
                        <UserCard key={user.id} user={user} onSelect={handleUserSelect} />
                    ))}
                </div>

                {/* Separate section for the create account button */}
                <div className="user-select__actions">
                    <Button variant="secondary" onClick={() => setCreateModalOpen(true)}>
                        Create New Account
                    </Button>
                </div>
            </div>

            {/* Login Modal */}
            <Modal
                isOpen={isLoginModalOpen}
                onClose={() => {
                    setLoginModalOpen(false);
                    setPassword(''); // Clear password on close
                }}
                title={`Enter password for ${selectedUser?.name}`}
            >
                <div className="form-group">
                    <Label htmlFor="password-input">Password</Label>
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
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleLogin}>
                        Login
                    </Button>
                </div>
            </Modal>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="Create New Account"
            >
                <div className="form-group">
                    <Label htmlFor="new-name">Name</Label>
                    <Input
                        id="new-name"
                        value={newUserData.name}
                        onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="new-password">Password (Optional)</Label>
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
                    <Label htmlFor="user-type">Account Type</Label>
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
                        <option value="learner">Learner</option>
                        <option value="admin">Admin</option>
                    </Select>
                </div>
                <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateUser}>
                        Create
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default UserSelectionPage;
