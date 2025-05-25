// frontend/src/pages/AdminLoginPage.jsx - SIMPLIFIED VERSION
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Hardcoded credentials untuk development
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'admin123'
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!formData.username.trim() || !formData.password.trim()) {
            setError('Username dan password harus diisi');
            setLoading(false);
            return;
        }

        // Simple authentication check
        if (formData.username.trim() === ADMIN_CREDENTIALS.username &&
            formData.password === ADMIN_CREDENTIALS.password) {

            // Store simple auth data
            localStorage.setItem('isAdminLoggedIn', 'true');
            localStorage.setItem('adminUser', JSON.stringify({
                username: formData.username,
                loginTime: new Date().toISOString()
            }));

            console.log('Login successful, redirecting...');
            navigate('/admin/dashboard', { replace: true });
        } else {
            setError('Username atau password salah');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Login
                    </h2>
                    <p className="text-gray-600">
                        Bandung Green Spaces - Sistem Informasi Geografis
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
                                <div className="flex items-center">
                                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Masukkan username"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Masukkan password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        {/* Login Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                    </form>

                    {/* Credentials Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="bg-blue-50 rounded-md p-3">
                            <p className="text-xs text-blue-600 font-medium">Login Credentials:</p>
                            <p className="text-xs text-blue-500">Username: admin</p>
                            <p className="text-xs text-blue-500">Password: admin123</p>
                        </div>
                    </div>
                </div>

                {/* Back to Home Link */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                        ← Kembali ke Beranda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;