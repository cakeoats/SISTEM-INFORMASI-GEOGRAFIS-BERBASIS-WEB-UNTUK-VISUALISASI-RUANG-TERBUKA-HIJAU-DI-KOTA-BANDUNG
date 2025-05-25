// src/components/ProtectedRoute.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true/false = result
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        verifyAuthentication();
    }, []);

    const verifyAuthentication = async () => {
        try {
            const token = localStorage.getItem('adminToken');

            console.log('ProtectedRoute: Checking token...', token ? 'Token exists' : 'No token');

            if (!token) {
                console.log('ProtectedRoute: No token found');
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            // Set axios header sebelum request
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            console.log('ProtectedRoute: Verifying token with API...');

            // Verify token dengan API
            const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 10000 // 10 second timeout
            });

            console.log('ProtectedRoute: API response:', response.data);

            if (response.data.success) {
                // Token valid, update user data jika perlu
                const adminData = response.data.data.admin;
                const existingUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

                // Update localStorage dengan data terbaru dari server
                localStorage.setItem('adminUser', JSON.stringify({
                    ...existingUser,
                    ...adminData,
                    verifiedAt: new Date().toISOString()
                }));

                console.log('ProtectedRoute: Token verified successfully');
                setIsAuthenticated(true);
            } else {
                console.log('ProtectedRoute: Token verification failed - invalid response');
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('ProtectedRoute: Token verification failed:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });

            // Clear invalid token
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            delete axios.defaults.headers.common['Authorization'];

            setIsAuthenticated(false);
        } finally {
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
                    <p className="mt-2 text-sm text-gray-500">Checking authentication...</p>
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