// src/pages/AdminLoginPage.jsx - Updated dengan Toast Notifications
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { showToast } from '../utils/toast';

const AdminLoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    // Check if already logged in
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            verifyExistingToken(token);
        }
    }, []);

    const verifyExistingToken = async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                showToast.info('Anda sudah login, mengalihkan ke dashboard...');
                navigate('/admin/dashboard');
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            showToast.error('Username harus diisi');
            return false;
        }

        if (!formData.password.trim()) {
            showToast.error('Password harus diisi');
            return false;
        }

        if (formData.username.trim().length < 3) {
            showToast.error('Username minimal 3 karakter');
            return false;
        }

        if (formData.password.length < 6) {
            showToast.error('Password minimal 6 karakter');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        const loadingToast = showToast.loading('Memverifikasi login...');

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                username: formData.username.trim(),
                password: formData.password
            }, {
                timeout: 10000 // 10 second timeout
            });

            if (response.data.success) {
                const { token, admin } = response.data.data;

                // Store auth data
                localStorage.setItem('adminToken', token);
                localStorage.setItem('adminUser', JSON.stringify({
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role,
                    lastLogin: admin.lastLogin,
                    loginTime: new Date().toISOString()
                }));

                // Set default authorization header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Success toast
                showToast.success(`Selamat datang, ${admin.username}! Login berhasil.`);

                // Small delay for better UX
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 1000);
            }
        } catch (err) {
            console.error('Login error:', err);

            let errorMessage = 'Login gagal. Silakan coba lagi.';

            if (err.response) {
                // Server responded with an error
                switch (err.response.status) {
                    case 401:
                        errorMessage = 'Username atau password salah';
                        break;
                    case 403:
                        errorMessage = 'Akun Anda tidak memiliki akses admin';
                        break;
                    case 429:
                        errorMessage = 'Terlalu banyak percobaan login. Coba lagi nanti.';
                        break;
                    case 500:
                        errorMessage = 'Server sedang bermasalah. Silakan coba lagi nanti.';
                        break;
                    default:
                        errorMessage = err.response.data?.message || errorMessage;
                }
            } else if (err.request) {
                // Request was made but no response
                errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
            } else if (err.code === 'ECONNABORTED') {
                // Timeout error
                errorMessage = 'Koneksi timeout. Silakan coba lagi.';
            }

            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleForgotPassword = () => {
        showToast.info('Hubungi administrator sistem untuk reset password');
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSubmit(e);
        }
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
                    <form className="space-y-6" onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Masukkan username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={loading}
                                    maxLength={50}
                                />
                            </div>
                            {formData.username && formData.username.length < 3 && (
                                <p className="mt-1 text-xs text-yellow-600">Username minimal 3 karakter</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Masukkan password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    maxLength={100}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={togglePasswordVisibility}
                                    disabled={loading}
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {formData.password && formData.password.length < 6 && (
                                <p className="mt-1 text-xs text-yellow-600">Password minimal 6 karakter</p>
                            )}
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors"
                                disabled={loading}
                            >
                                Lupa Password?
                            </button>
                        </div>

                        {/* Login Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading || !formData.username.trim() || !formData.password.trim()}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memverifikasi...
                                    </div>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <p className="text-xs text-gray-500">
                                Sistem Admin - Bandung Green Spaces
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Hanya untuk administrator yang berwenang
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back to Home Link */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        disabled={loading}
                        className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ← Kembali ke Beranda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;