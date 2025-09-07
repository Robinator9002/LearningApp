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
// Learner Pages
import LearnerDashboardPage from './pages/learner/LearnerDashboardPage';
import CoursePlayerPage from './pages/learner/CoursePlayerPage';
import ProgressTrackerPage from './pages/learner/ProgressTrackerPage'; // NEW: Import the new page
// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CourseEditorPage from './pages/admin/CourseEditorPage';
// Settings Page
import SettingsPage from './pages/settings/SettingsPage';

/**
 * LoggedInUserRoute is a new guard that allows access to any user
 * who is currently logged in, regardless of their type.
 */
const LoggedInUserRoute: React.FC = () => {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error('Component must be used within an AuthProvider');
    if (auth.isLoading) return <div>Loading...</div>;
    return auth.currentUser ? <Outlet /> : <Navigate to="/" replace />;
};

/**
 * AppLayout serves as the main visual shell for the application.
 * It conditionally renders the Topbar for logged-in users or a simple
 * header for the initial user selection screen.
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
 * AppCore contains the main routing logic of the application.
 */
const AppCore: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AppLayout />}>
                {/* Public Route */}
                <Route index element={<UserSelectionPage />} />

                {/* Routes for any logged in user */}
                <Route element={<LoggedInUserRoute />}>
                    <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Learner-Only Routes */}
                <Route element={<ProtectedRoute allowedType="learner" />}>
                    <Route path="dashboard" element={<LearnerDashboardPage />} />
                    <Route path="player/:courseId" element={<CoursePlayerPage />} />
                    {/* NEW: Add the route for the progress tracker */}
                    <Route path="progress" element={<ProgressTrackerPage />} />
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
 * The order here is CRITICAL for dependency injection.
 */
const App: React.FC = () => {
    return (
        // CRITICAL FIX: ThemeProvider MUST wrap AuthProvider because AuthProvider
        // now depends on the useTheme hook to load user-specific themes.
        <ThemeProvider>
            <AuthProvider>
                <ModalProvider>
                    <AppCore />
                </ModalProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
