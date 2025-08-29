// src/App.tsx

import React, { useContext } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import styles from './App.module.css';

// --- CONTEXTS & HOOKS ---
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { ThemeProvider } from './contexts/ThemeContext';

// --- CORE COMPONENTS ---
import Topbar from './components/topbar/Topbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// --- PAGE COMPONENTS ---
import UserSelectionPage from './pages/UserSelectionPage';
import SettingsPage from './pages/settings/SettingsPage'; // New import
// Learner Pages
import LearnerDashboardPage from './pages/learner/LearnerDashboardPage';
import CoursePlayerPage from './pages/learner/CoursePlayerPage';
// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CourseEditorPage from './pages/admin/CourseEditorPage';

/**
 * A new route protection component.
 * This wrapper ensures that a user is logged in to access its children routes,
 * regardless of their type ('admin' or 'learner').
 */
const LoggedInUserRoute: React.FC = () => {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error('Component must be used within an AuthProvider');

    const { currentUser, isLoading } = auth;

    if (isLoading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    // If there is no user, redirect to the login/selection page.
    if (!currentUser) {
        return <Navigate to="/" replace />;
    }

    // If a user is logged in, render the child routes.
    return <Outlet />;
};

/**
 * AppLayout serves as the main visual shell for the application.
 * Its logic remains unchanged.
 */
const AppLayout: React.FC = () => {
    const auth = useContext(AuthContext);
    const hasUser = !!auth?.currentUser;

    return (
        <div className={hasUser ? '' : styles.appLayout}>
            {hasUser ? (
                <Topbar />
            ) : (
                <header className={styles.appHeader}>
                    <h1 className={styles.appTitle}>Learning App</h1>
                </header>
            )}
            <main className={styles.pageContent}>
                <Outlet />
            </main>
        </div>
    );
};

/**
 * AppCore contains the main routing logic, now including the new /settings route.
 */
const AppCore: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AppLayout />}>
                {/* Public Route */}
                <Route index element={<UserSelectionPage />} />

                {/* Routes for ANY Logged-in User */}
                <Route element={<LoggedInUserRoute />}>
                    <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Learner-Only Routes */}
                <Route element={<ProtectedRoute allowedType="learner" />}>
                    <Route path="dashboard" element={<LearnerDashboardPage />} />
                    <Route path="player/:courseId" element={<CoursePlayerPage />} />
                </Route>

                {/* Admin-Only Routes */}
                <Route element={<ProtectedRoute allowedType="admin" />}>
                    <Route path="admin" element={<AdminDashboardPage />} />
                    <Route path="admin/create-course" element={<CourseEditorPage />} />
                    <Route path="admin/edit-course/:courseId" element={<CourseEditorPage />} />
                </Route>
            </Route>
        </Routes>
    );
};

/**
 * The root App component wraps the entire application with necessary context providers.
 */
const App: React.FC = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <ModalProvider>
                    <AppCore />
                </ModalProvider>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;
