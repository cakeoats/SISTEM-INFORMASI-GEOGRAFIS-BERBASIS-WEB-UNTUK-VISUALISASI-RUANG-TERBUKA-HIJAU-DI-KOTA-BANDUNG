// src/components/ProtectedRoute.jsx - Updated dengan API verification
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

            if (!token) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            // Verify token dengan API
            const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

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

                // Set axios default header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Token verification failed:', error);

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
                </div>
            </div>
        );
    }

    // Not authenticated, redirect to login
    if (isAuthenticated === false) {
        return <Navigate to="/admin/login" replace />;
    }

    // Authenticated, render the protected component
    return children;
};

export default ProtectedRoute;