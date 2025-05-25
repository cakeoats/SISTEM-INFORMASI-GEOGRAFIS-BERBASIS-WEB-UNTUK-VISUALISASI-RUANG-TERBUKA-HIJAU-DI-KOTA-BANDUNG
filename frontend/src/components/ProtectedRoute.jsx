// src/components/ProtectedRoute.jsx - SIMPLIFIED VERSION (tanpa verifikasi API)
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true/false = result
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = () => {
        try {
            const token = localStorage.getItem('adminToken');
            const adminUser = localStorage.getItem('adminUser');

            console.log('ProtectedRoute: Checking authentication...', {
                hasToken: !!token,
                hasUser: !!adminUser
            });

            if (!token || !adminUser) {
                console.log('ProtectedRoute: No token or user data found');
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            // Parse user data untuk validasi
            try {
                const userData = JSON.parse(adminUser);
                console.log('ProtectedRoute: User data found:', userData.username);

                // Set axios default header untuk request selanjutnya
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Token dan user data ada, anggap authenticated
                setIsAuthenticated(true);
                console.log('ProtectedRoute: Authentication successful');
            } catch (parseError) {
                console.error('ProtectedRoute: Error parsing user data:', parseError);
                // Clear invalid data
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                setIsAuthenticated(false);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('ProtectedRoute: Error checking authentication:', error);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memverifikasi akses...</p>
                </div>
            </div>
        );
    }

    // Not authenticated, redirect to login
    if (isAuthenticated === false) {
        console.log('ProtectedRoute: Redirecting to login');
        return <Navigate to="/admin/login" replace />;
    }

    // Authenticated, render the protected component
    console.log('ProtectedRoute: Access granted');
    return children;
};

export default ProtectedRoute;