// src/components/common/Topbar/Topbar.tsx
import React, { useContext } from 'react';
import { LogOut } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Topbar: React.FC = () => {
    const { t } = useTranslation();
    const auth = useContext(AuthContext);

    if (!auth || !auth.currentUser) {
        return null; // Don't render if there's no user
    }

    const { currentUser, logout } = auth;

    return (
        <header className="topbar">
            <div className="topbar__brand">{t('appTitle')}</div>
            <div className="topbar__user-info">
                <span className="topbar__user-name">Welcome, {currentUser.name}</span>
                <button className="icon-btn" onClick={logout} title="Logout">
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
