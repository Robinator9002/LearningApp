// src/App.tsx
import React, { useContext } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import styles from './App.module.css';

// --- CONTEXTS & HOOKS ---
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useDatabaseSeed } from './hooks/useDatabaseSeed';

// --- CORE COMPONENTS ---
import Topbar from './components/topbar/Topbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// --- PAGE COMPONENTS ---
import UserSelectionPage from './pages/UserSelectionPage';
// Learner Pages
import LearnerDashboardPage from './pages/learner/LearnerDashboardPage';
import CoursePlayerPage from './pages/learner/CoursePlayerPage';
// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CourseEditorPage from './pages/admin/CourseEditorPage';

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
 * AppCore contains the main routing logic. It ensures the database is seeded
 * before rendering any routes.
 */
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
                {/* Public Route */}
                <Route index element={<UserSelectionPage />} />

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
