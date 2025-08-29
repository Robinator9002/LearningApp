// src/components/topbar/Topbar.tsx

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react'; // Import the Settings icon
import { AuthContext } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

/**
 * The Topbar component displays at the top of the application for logged-in users.
 * It shows the app title, the current user's name, and provides actions
 * like logging out and navigating to the settings page.
 */
const Topbar: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    // This component should not render at all if there is no authenticated user.
    // The AppLayout component already handles this logic.
    if (!auth || !auth.currentUser) {
        return null;
    }

    const { currentUser, logout } = auth;

    return (
        <header className="topbar">
            <div className="topbar__brand">{t('appTitle')}</div>
            <div className="topbar__user-info">
                <span className="topbar__user-name">Welcome, {currentUser.name}</span>

                {/* Settings Icon Button */}
                {/* This button navigates the user to the unified settings page. */}
                <button className="icon-btn" onClick={() => navigate('/settings')} title="Settings">
                    <Settings size={20} />
                </button>

                {/* Existing Logout Button */}
                <button className="icon-btn" onClick={logout} title="Logout">
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
