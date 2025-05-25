// frontend/src/pages/AdminDashboard.jsx - Updated dengan tab navigation dan RTH management
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RthManagement from '../components/RthManagement';
import { API_BASE_URL } from '../config';

const AdminDashboard = () => {
    const [adminData, setAdminData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, rth-management
    const navigate = useNavigate();

    useEffect(() => {
        fetchAdminData();
        fetchSystemStats();
    }, []);

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setAdminData(response.data.data.admin);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            setError('Gagal memuat data admin');
        }
    };

    const fetchSystemStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');

            // Fetch RTH statistics
            const rthResponse = await axios.get(`${API_BASE_URL}/api/rth-kecamatan`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const rthData = rthResponse.data;

            if (Array.isArray(rthData)) {
                const totalKecamatan = rthData.length;
                const totalRth = rthData.reduce((sum, item) => sum + (parseFloat(item.total_rth) || 0), 0);
                const totalLuasKecamatan = rthData.reduce((sum, item) => sum + (parseFloat(item.luas_kecamatan) || 0), 0);
                const persentaseRth = totalLuasKecamatan > 0 ? (totalRth / totalLuasKecamatan) * 100 : 0;

                // Cluster distribution
                const clusterDistribution = rthData.reduce((acc, item) => {
                    const cluster = item.cluster || 'undefined';
                    acc[cluster] = (acc[cluster] || 0) + 1;
                    return acc;
                }, {});

                setStats({
                    totalKecamatan,
                    totalRth: totalRth.toFixed(2),
                    persentaseRth: persentaseRth.toFixed(2),
                    clusterDistribution
                });
            }
        } catch (error) {
            console.error('Error fetching system stats:', error);
            // Don't set error for stats, just log it
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('adminToken');

            // Call logout API
            if (token) {
                await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with logout even if API fails
        } finally {
            // Clear authentication data
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            delete axios.defaults.headers.common['Authorization'];

            // Redirect to login
            navigate('/admin/login');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Tidak tersedia';
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Admin Dashboard
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-700">
                                Welcome, <span className="font-medium">{adminData?.username || 'Admin'}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('rth-management')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'rth-management'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Manajemen Data RTH
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Overview Tab Content */}
                {activeTab === 'overview' && (
                    <>
                        {/* System Statistics */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Total RTH</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.totalRth} ha</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Persentase RTH</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.persentaseRth}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Total Kecamatan</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.totalKecamatan}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Target RTH</p>
                                            <p className="text-2xl font-bold text-gray-900">20%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Admin Info and Cluster Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold mb-4">Informasi Admin</h3>
                                {adminData ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Username:</span>
                                            <span className="font-medium">{adminData.username}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-medium">{adminData.email || 'Tidak tersedia'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Role:</span>
                                            <span className="font-medium capitalize">{adminData.role}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Login:</span>
                                            <span className="font-medium text-sm">{formatDate(adminData.lastLogin)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Memuat informasi admin...</p>
                                )}
                            </div>

                            {/* Cluster Distribution */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold mb-4">Distribusi Cluster RTH</h3>
                                {stats?.clusterDistribution ? (
                                    <div className="space-y-3">
                                        {Object.entries(stats.clusterDistribution).map(([cluster, count]) => {
                                            const getClusterInfo = (cluster) => {
                                                switch (cluster) {
                                                    case 'cluster_0':
                                                        return { name: 'Cluster 0 (RTH Rendah)', color: 'bg-red-500' };
                                                    case 'cluster_1':
                                                        return { name: 'Cluster 1 (RTH Menengah)', color: 'bg-yellow-500' };
                                                    case 'cluster_2':
                                                        return { name: 'Cluster 2 (RTH Tinggi)', color: 'bg-green-500' };
                                                    default:
                                                        return { name: cluster, color: 'bg-gray-500' };
                                                }
                                            };

                                            const clusterInfo = getClusterInfo(cluster);
                                            const percentage = stats.totalKecamatan > 0 ? (count / stats.totalKecamatan * 100).toFixed(1) : 0;

                                            return (
                                                <div key={cluster} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className={`w-3 h-3 rounded-full mr-3 ${clusterInfo.color}`}></div>
                                                        <span className="text-sm font-medium">{clusterInfo.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold">{count}</span>
                                                        <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Memuat data cluster...</p>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <button
                                    onClick={() => setActiveTab('rth-management')}
                                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors"
                                >
                                    <div className="text-center">
                                        <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p className="font-medium">Kelola Data RTH</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/data')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors"
                                >
                                    <div className="text-center">
                                        <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                        <p className="font-medium">Lihat Data RTH</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/peta')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors"
                                >
                                    <div className="text-center">
                                        <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        <p className="font-medium">Lihat Peta</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg transition-colors"
                                >
                                    <div className="text-center">
                                        <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <p className="font-medium">Ke Beranda</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* RTH Management Tab Content */}
                {activeTab === 'rth-management' && (
                    <RthManagement />
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;