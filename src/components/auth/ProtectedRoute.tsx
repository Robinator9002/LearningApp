// src/components/auth/ProtectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import type { IUser } from '../../types/database';

interface ProtectedRouteProps {
    allowedType: IUser['type'];
}

/**
 * A component that protects routes based on the current user's type.
 * If the user is not logged in or does not have the required type,
 * it redirects them to the home page.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedType }) => {
    const auth = useContext(AuthContext);

    if (!auth) {
        throw new Error('ProtectedRoute must be used within an AuthProvider');
    }

    const { currentUser, isLoading } = auth;

    // While we are checking the session, don't render anything
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // If there is no user or the user type doesn't match, redirect
    if (!currentUser || currentUser.type !== allowedType) {
        // Redirect them to the user selection page.
        // The `replace` prop prevents the user from navigating back to the protected page.
        return <Navigate to="/" replace />;
    }

    // If the user is authenticated and has the correct type, render the child route
    return <Outlet />;
};

export default ProtectedRoute;
