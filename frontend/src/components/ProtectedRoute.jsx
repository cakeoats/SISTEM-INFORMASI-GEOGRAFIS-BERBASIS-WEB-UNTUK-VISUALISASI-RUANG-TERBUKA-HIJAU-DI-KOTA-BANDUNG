// frontend/src/components/ProtectedRoute.jsx - ULTRA SIMPLE VERSION
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Simple check for authentication
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

    console.log('ProtectedRoute: isLoggedIn =', isLoggedIn);

    if (!isLoggedIn) {
        console.log('ProtectedRoute: Not logged in, redirecting to login');
        return <Navigate to="/admin/login" replace />;
    }

    console.log('ProtectedRoute: Access granted');
    return children;
};

export default ProtectedRoute;