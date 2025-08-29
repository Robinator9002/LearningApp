// src/pages/UserSelectionPage.tsx

import React, { useContext, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { db } from '../lib/db';
import { AuthContext } from '../contexts/AuthContext';
import { ModalContext } from '../contexts/ModalContext';
import type { IUser } from '../types/database';

import Button from '../components/common/Button/Button';
import Modal from '../components/common/Modal/Modal';
import Input from '../components/common/Form/Input/Input';
import Label from '../components/common/Form/Label/Label';

/**
 * The page where users select their profile to log in or create a new one.
 * Now handles password checks for protected accounts.
 */
const UserSelectionPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const modal = useContext(ModalContext);

    // --- STATE MANAGEMENT ---
    const [adminName, setAdminName] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');

    // State for the password login modal
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [loginPassword, setLoginPassword] = useState('');

    const users = useLiveQuery(() => db.users.toArray(), []);

    if (!auth || !modal) {
        throw new Error('This component must be used within AuthProvider and ModalProvider.');
    }

    // --- EVENT HANDLERS ---
    const handleUserSelect = (user: IUser) => {
        // If the selected user does not have a password, log them in directly.
        if (!user.password) {
            auth.login(user);
            if (user.type === 'admin') navigate('/admin');
            else navigate('/dashboard');
        } else {
            // If a password exists, open the login modal.
            setSelectedUser(user);
            setLoginPassword('');
            setIsLoginModalOpen(true);
        }
    };

    const handlePasswordLogin = () => {
        if (!selectedUser) return;

        // Check if the entered password matches the user's stored password.
        if (loginPassword === selectedUser.password) {
            auth.login(selectedUser);
            setIsLoginModalOpen(false);
            if (selectedUser.type === 'admin') navigate('/admin');
            else navigate('/dashboard');
        } else {
            // Show an error message if the password is incorrect.
            modal.showAlert({
                title: 'Login Failed',
                message: 'The password you entered is incorrect.',
            });
            setLoginPassword(''); // Clear the input
        }
    };

    const handleCreateFirstAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = adminName.trim();
        if (!trimmedName) return;
        try {
            const newUser: IUser = { name: trimmedName, type: 'admin' };
            const newId = await db.users.add(newUser);
            const createdUser = await db.users.get(newId);
            if (createdUser) {
                auth.login(createdUser);
                navigate('/admin');
            }
        } catch (error) {
            console.error('Failed to create first admin:', error);
            modal.showAlert({ title: 'Error', message: 'Could not create admin account.' });
        }
    };

    const handleOpenCreateModal = () => {
        setNewUserName('');
        setNewUserPassword('');
        setIsCreateModalOpen(true);
    };

    const handleSaveNewUser = async () => {
        const trimmedName = newUserName.trim();
        if (!trimmedName) {
            modal.showAlert({ title: 'Invalid Input', message: 'Name cannot be empty.' });
            return;
        }
        try {
            const newUser: IUser = {
                name: trimmedName,
                type: 'learner',
                ...(newUserPassword && { password: newUserPassword }),
            };
            await db.users.add(newUser);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Failed to create new user:', error);
            modal.showAlert({
                title: 'Creation Error',
                message: 'Could not create user. The name might be taken.',
            });
        }
    };

    // --- RENDER LOGIC ---
    if (users === undefined) return <p>Loading profiles...</p>;

    if (users.length === 0) {
        return (
            <div className="user-select">
                <h2 className="user-select__title">Welcome! Let's Get Started.</h2>
                <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                    Create the first Admin account to manage the app.
                </p>
                <form
                    className="user-select__form"
                    onSubmit={handleCreateFirstAdmin}
                    style={{ width: '100%', maxWidth: '300px' }}
                >
                    <div className="form-group">
                        <Label htmlFor="admin-name">Admin Name</Label>
                        <Input
                            id="admin-name"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <Button type="submit" variant="primary" style={{ width: '100%' }}>
                        Create Admin Account
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <>
            <div className="user-select">
                <h2 className="user-select__title">{t('userSelection.title')}</h2>
                <div className="user-select__actions">
                    {users.map((user) => (
                        <Button key={user.id} onClick={() => handleUserSelect(user)}>
                            {user.name}
                        </Button>
                    ))}
                </div>
                <div className="user-select__footer">
                    <Button onClick={handleOpenCreateModal}>Create New Account</Button>
                </div>
            </div>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create a New Learner Account"
            >
                <div className="form-group">
                    <Label htmlFor="new-user-name">Your Name</Label>
                    <Input
                        id="new-user-name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="new-user-password">Password (Optional)</Label>
                    <Input
                        id="new-user-password"
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                    />
                </div>
                <div className="modal-footer">
                    <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveNewUser}>
                        Create Account
                    </Button>
                </div>
            </Modal>

            {/* Password Login Modal */}
            <Modal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                title={`Enter Password for ${selectedUser?.name}`}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handlePasswordLogin();
                    }}
                >
                    <div className="form-group">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                            id="login-password"
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="modal-footer">
                        <Button type="button" onClick={() => setIsLoginModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Log In
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default UserSelectionPage;
