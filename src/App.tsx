// src/App.tsx
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import styles from './App.module.css';

// Import page components
import UserSelectionPage from './pages/UserSelectionPage';
import LearnerDashboardPage from './pages/LearnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

import "./styles/main.css"

/**
 * The main application layout component.
 * It includes a consistent header and an Outlet to render the current page.
 */
const AppLayout: React.FC = () => {
    return (
        <div className={styles.appLayout}>
            <header className={styles.appHeader}>
                <h1 className={styles.appTitle}>Learning App</h1>
            </header>
            <main className={styles.pageContent}>
                {/* The Outlet component renders the matched child route's component */}
                <Outlet />
            </main>
        </div>
    );
};

/**
 * The main App component that defines the application's routing structure.
 */
const App: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AppLayout />}>
                {/* Index route defaults to the UserSelectionPage */}
                <Route index element={<UserSelectionPage />} />
                <Route path="dashboard" element={<LearnerDashboardPage />} />
                <Route path="admin" element={<AdminDashboardPage />} />
                {/* A catch-all route for 404 Not Found pages can be added here later */}
            </Route>
        </Routes>
    );
};

export default App;
