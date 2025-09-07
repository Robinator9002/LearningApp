// src/components/topbar/Topbar.tsx

import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Settings, TrendingUp } from 'lucide-react'; // MODIFICATION: Import new icon
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

    if (!auth || !auth.currentUser) {
        return null;
    }

    const { currentUser, logout } = auth;
    const isLearner = currentUser.type === 'learner';

    return (
        <header className="topbar">
            {/* MODIFICATION: The brand is now a link to the appropriate dashboard */}
            <NavLink
                to={isLearner ? '/dashboard' : '/admin'}
                className="topbar__brand"
                end // Use 'end' to only match the exact path
            >
                {t('appTitle')}
            </NavLink>

            {/* MODIFICATION: Added a dedicated navigation section */}
            <nav className="topbar__nav">
                {isLearner && (
                    <NavLink to="/progress" className="topbar__nav-link">
                        <TrendingUp size={18} />
                        <span>{t('topbar.myProgress')}</span>
                    </NavLink>
                )}
            </nav>

            <div className="topbar__user-info">
                <span className="topbar__user-name">{currentUser.name}</span>

                <button
                    className="icon-btn"
                    onClick={() => navigate('/settings')}
                    title={t('topbar.settings')}
                >
                    <Settings size={20} />
                </button>

                <button className="icon-btn" onClick={logout} title={t('topbar.logout')}>
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
