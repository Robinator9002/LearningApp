// src/App.tsx
import React, { useContext } from 'react'; // Import useContext
import { Routes, Route, Outlet } from 'react-router-dom';
import styles from './App.module.css';

// Import contexts and hooks
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { useDatabaseSeed } from './hooks/useDatabaseSeed';

// Import components
import Topbar from './components/topbar/Topbar'; // Import the new Topbar
import UserSelectionPage from './pages/UserSelectionPage';
import LearnerDashboardPage from './pages/LearnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CourseEditorPage from './pages/admin/CourseEditorPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppLayout: React.FC = () => {
    const auth = useContext(AuthContext);
    const hasUser = !!auth?.currentUser;

    return (
        // We remove the main appLayout style if there is a user,
        // as the Topbar provides its own structure.
        <div className={hasUser ? '' : styles.appLayout}>
            {/* Conditionally render the Topbar or the old header */}
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
                <AppCore />
            </ModalProvider>
        </AuthProvider>
    );
};

export default App;
