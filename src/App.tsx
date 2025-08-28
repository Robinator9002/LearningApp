// src/App.tsx
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import styles from './App.module.css';
import { useTranslation } from 'react-i18next';

// Import contexts and hooks
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext'; // Import ModalProvider
import { useDatabaseSeed } from './hooks/useDatabaseSeed';

// Import page components
import UserSelectionPage from './pages/UserSelectionPage';
import LearnerDashboardPage from './pages/LearnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CourseEditorPage from './pages/admin/CourseEditorPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppLayout: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className={styles.appLayout}>
            <header className={styles.appHeader}>
                <h1 className={styles.appTitle}>{t('appTitle')}</h1>
            </header>
            <main className={styles.pageContent}>
                <Outlet />
            </main>
        </div>
    );
};

const AppCore: React.FC = () => {
    const { isSeeding, error } = useDatabaseSeed();

    if (isSeeding) {
        return <div>Loading Database...</div>;
    }

    if (error) {
        return <div>Error initializing database: {error.message}</div>;
    }

    return (
        <Routes>
            <Route path="/" element={<AppLayout />}>
                <Route index element={<UserSelectionPage />} />

                <Route element={<ProtectedRoute allowedType="learner" />}>
                    <Route path="dashboard" element={<LearnerDashboardPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedType="admin" />}>
                    <Route path="admin" element={<AdminDashboardPage />} />
                    <Route path="admin/create-course" element={<CourseEditorPage />} />
                    <Route path="admin/edit-course/:courseId" element={<CourseEditorPage />} />
                </Route>
            </Route>
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ModalProvider>
                {' '}
                {/* Wrap the core app with the ModalProvider */}
                <AppCore />
            </ModalProvider>
        </AuthProvider>
    );
};

export default App;
