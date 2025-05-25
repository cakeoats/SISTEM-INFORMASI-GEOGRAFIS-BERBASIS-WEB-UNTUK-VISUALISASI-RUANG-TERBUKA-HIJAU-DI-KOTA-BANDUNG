// frontend/src/components/RthManagement.jsx - FULL CRUD RESTORED
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelDataLoader from './ExcelDataLoader';
import { API_BASE_URL } from '../config';

const RthManagement = () => {
    const [rthData, setRthData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCluster, setSelectedCluster] = useState('all');
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'ascending'
    });

    // Form state
    const [formData, setFormData] = useState({
        kecamatan: '',
        luas_taman: '',
        luas_pemakaman: '',
        total_rth: '',
        luas_kecamatan: '',
        cluster: 'cluster_0'
    });

    useEffect(() => {
        fetchRthData();
    }, []);

    // Filter and sort data when dependencies change
    useEffect(() => {
        let result = [...rthData];

        // Filter by cluster
        if (selectedCluster !== 'all') {
            result = result.filter(item => item.cluster === selectedCluster);
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.kecamatan || '').toLowerCase().includes(searchLower)
            );
        }

        // Sort data
        if (sortConfig.key) {
            result.sort((a, b) => {
                if (a[sortConfig.key] === null || a[sortConfig.key] === undefined)
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                if (b[sortConfig.key] === null || b[sortConfig.key] === undefined)
                    return sortConfig.direction === 'ascending' ? 1 : -1;

                if (typeof a[sortConfig.key] === 'number' && typeof b[sortConfig.key] === 'number') {
                    return sortConfig.direction === 'ascending'
                        ? a[sortConfig.key] - b[sortConfig.key]
                        : b[sortConfig.key] - a[sortConfig.key];
                }

                return sortConfig.direction === 'ascending'
                    ? String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]))
                    : String(b[sortConfig.key]).localeCompare(String(a[sortConfig.key]));
            });
        }

        setFilteredData(result);
    }, [rthData, searchTerm, selectedCluster, sortConfig]);

    const fetchRthData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try authenticated endpoint first, fallback to public if auth fails
            let response;
            try {
                // Check if we have authentication
                const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

                if (isLoggedIn) {
                    // Try to use authenticated endpoint with a simple token approach
                    response = await axios.get(`${API_BASE_URL}/api/rth-kecamatan`, {
                        headers: {
                            'Authorization': 'Bearer simple-admin-token'
                        }
                    });
                } else {
                    throw new Error('Not authenticated');
                }
            } catch (authError) {
                console.log('Auth failed, using public endpoint:', authError.message);
                // Fallback to public endpoint
                response = await axios.get(`${API_BASE_URL}/api/rth-kecamatan/public`);
            }

            const formattedData = response.data.map((item, index) => ({
                id: item._id,
                index: index + 1,
                kecamatan: item.kecamatan || '',
                luas_taman: parseFloat(item.luas_taman) || 0,
                luas_pemakaman: parseFloat(item.luas_pemakaman) || 0,
                total_rth: parseFloat(item.total_rth) || 0,
                luas_kecamatan: parseFloat(item.luas_kecamatan) || 0,
                cluster: item.cluster || 'cluster_0'
            }));

            setRthData(formattedData);
        } catch (err) {
            console.error('Error fetching RTH data:', err);
            setError('Gagal mengambil data RTH: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.kecamatan.trim()) {
            alert('Nama kecamatan harus diisi');
            return false;
        }

        const numericFields = ['luas_taman', 'luas_pemakaman', 'total_rth', 'luas_kecamatan'];
        for (let field of numericFields) {
            if (formData[field] === '' || isNaN(parseFloat(formData[field]))) {
                alert(`${field.replace(/_/g, ' ').toUpperCase()} harus berupa angka yang valid`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSaveLoading(true);

        try {
            const submitData = {
                kecamatan: formData.kecamatan.trim(),
                luas_taman: parseFloat(formData.luas_taman),
                luas_pemakaman: parseFloat(formData.luas_pemakaman),
                total_rth: parseFloat(formData.total_rth),
                luas_kecamatan: parseFloat(formData.luas_kecamatan),
                cluster: formData.cluster
            };

            console.log('Submitting data:', submitData);

            // Check authentication
            const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
            if (!isLoggedIn) {
                alert('Anda harus login sebagai admin untuk melakukan operasi ini');
                return;
            }

            const headers = {
                'Authorization': 'Bearer simple-admin-token',
                'Content-Type': 'application/json'
            };

            if (editingItem) {
                // Update existing item
                try {
                    await axios.put(`${API_BASE_URL}/api/rth-kecamatan/${editingItem.id}`, submitData, { headers });
                    alert('Data berhasil diperbarui');
                } catch (error) {
                    if (error.response?.status === 401) {
                        alert('Tidak memiliki akses untuk mengupdate data');
                    } else {
                        throw error;
                    }
                }
            } else {
                // Create new item
                try {
                    await axios.post(`${API_BASE_URL}/api/rth-kecamatan`, submitData, { headers });
                    alert('Data berhasil ditambahkan');
                } catch (error) {
                    if (error.response?.status === 401) {
                        alert('Tidak memiliki akses untuk menambah data');
                    } else {
                        throw error;
                    }
                }
            }

            // Reset form and close modal
            setFormData({
                kecamatan: '',
                luas_taman: '',
                luas_pemakaman: '',
                total_rth: '',
                luas_kecamatan: '',
                cluster: 'cluster_0'
            });
            setEditingItem(null);
            setShowModal(false);

            // Refresh data
            fetchRthData();

        } catch (err) {
            console.error('Error saving data:', err);
            alert('Gagal menyimpan data: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaveLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            kecamatan: item.kecamatan,
            luas_taman: item.luas_taman.toString(),
            luas_pemakaman: item.luas_pemakaman.toString(),
            total_rth: item.total_rth.toString(),
            luas_kecamatan: item.luas_kecamatan.toString(),
            cluster: item.cluster
        });
        setShowModal(true);
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus data ${item.kecamatan}?`)) {
            return;
        }

        try {
            // Check authentication
            const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
            if (!isLoggedIn) {
                alert('Anda harus login sebagai admin untuk melakukan operasi ini');
                return;
            }

            const headers = {
                'Authorization': 'Bearer simple-admin-token'
            };

            try {
                await axios.delete(`${API_BASE_URL}/api/rth-kecamatan/${item.id}`, { headers });
                alert('Data berhasil dihapus');
                fetchRthData();
            } catch (error) {
                if (error.response?.status === 401) {
                    alert('Tidak memiliki akses untuk menghapus data');
                } else {
                    throw error;
                }
            }
        } catch (err) {
            console.error('Error deleting data:', err);
            alert('Gagal menghapus data: ' + (err.response?.data?.message || err.message));
        }
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortDirection = (key) => {
        if (sortConfig.key !== key) return '';
        return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    };

    const getClusterColor = (cluster) => {
        switch (cluster) {
            case 'cluster_0':
                return 'bg-red-100 text-red-800';
            case 'cluster_1':
                return 'bg-yellow-100 text-yellow-800';
            case 'cluster_2':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getUniqueClusters = () => {
        const uniqueClusters = [...new Set(rthData.map(item => item.cluster))].filter(Boolean);
        return ['all', ...uniqueClusters];
    };

    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAdminLoggedIn') === 'true';

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
                    <p className="mt-2">Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Manajemen Data RTH</h2>
                <button
                    onClick={() => {
                        if (!isAuthenticated) {
                            alert('Anda harus login sebagai admin untuk menambah data');
                            return;
                        }
                        setEditingItem(null);
                        setFormData({
                            kecamatan: '',
                            luas_taman: '',
                            luas_pemakaman: '',
                            total_rth: '',
                            luas_kecamatan: '',
                            cluster: 'cluster_0'
                        });
                        setShowModal(true);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium ${isAuthenticated
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                    disabled={!isAuthenticated}
                >
                    + Tambah Data RTH
                </button>
            </div>

            {/* Authentication Status */}
            {isAuthenticated ? (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm">
                            <strong>Mode Admin:</strong> Semua fitur CRUD aktif. Anda dapat menambah, mengedit, dan menghapus data.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm">
                            <strong>Mode Read-Only:</strong> Login sebagai admin untuk mengakses fitur CRUD.
                        </p>
                    </div>
                </div>
            )}

            {/* Excel Data Loader - Only for authenticated users */}
            {isAuthenticated && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Upload Data Excel</h3>
                    <ExcelDataLoader onDataLoaded={fetchRthData} />
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cari Kecamatan
                        </label>
                        <input
                            type="text"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="Ketik nama kecamatan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter Cluster
                        </label>
                        <select
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            value={selectedCluster}
                            onChange={(e) => setSelectedCluster(e.target.value)}
                        >
                            {getUniqueClusters().map(cluster => (
                                <option key={cluster} value={cluster}>
                                    {cluster === 'all' ? 'Semua Cluster' : cluster}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">
                        Data RTH Kecamatan
                        {filteredData.length !== rthData.length &&
                            ` (${filteredData.length} dari ${rthData.length})`}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('kecamatan')}
                                >
                                    Kecamatan {getSortDirection('kecamatan')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('luas_taman')}
                                >
                                    Luas Taman (ha) {getSortDirection('luas_taman')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('luas_pemakaman')}
                                >
                                    Luas Pemakaman (ha) {getSortDirection('luas_pemakaman')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('total_rth')}
                                >
                                    Total RTH (ha) {getSortDirection('total_rth')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('luas_kecamatan')}
                                >
                                    Luas Kecamatan (ha) {getSortDirection('luas_kecamatan')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('cluster')}
                                >
                                    Cluster {getSortDirection('cluster')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.kecamatan}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{item.luas_taman.toFixed(3)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{item.luas_pemakaman.toFixed(3)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{item.total_rth.toFixed(3)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{item.luas_kecamatan.toFixed(0)}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${getClusterColor(item.cluster)}`}>
                                                {item.cluster}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className={`font-medium ${isAuthenticated
                                                            ? 'text-blue-600 hover:text-blue-800'
                                                            : 'text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    disabled={!isAuthenticated}
                                                    title={isAuthenticated ? 'Edit data' : 'Login sebagai admin untuk mengedit'}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className={`font-medium ${isAuthenticated
                                                            ? 'text-red-600 hover:text-red-800'
                                                            : 'text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    disabled={!isAuthenticated}
                                                    title={isAuthenticated ? 'Hapus data' : 'Login sebagai admin untuk menghapus'}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-sm text-gray-500">
                                        {searchTerm || selectedCluster !== 'all'
                                            ? 'Tidak ada data yang sesuai dengan filter'
                                            : 'Belum ada data RTH'
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingItem ? 'Edit Data RTH' : 'Tambah Data RTH Baru'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Kecamatan *
                                    </label>
                                    <input
                                        type="text"
                                        name="kecamatan"
                                        value={formData.kecamatan}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                        placeholder="Masukkan nama kecamatan"
                                        required
                                        disabled={saveLoading}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Luas Taman (ha) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            name="luas_taman"
                                            value={formData.luas_taman}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                            placeholder="0.000"
                                            required
                                            disabled={saveLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Luas Pemakaman (ha) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            name="luas_pemakaman"
                                            value={formData.luas_pemakaman}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                            placeholder="0.000"
                                            required
                                            disabled={saveLoading}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Total RTH (ha) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            name="total_rth"
                                            value={formData.total_rth}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                            placeholder="0.000"
                                            required
                                            disabled={saveLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Luas Kecamatan (ha) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            name="luas_kecamatan"
                                            value={formData.luas_kecamatan}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                            placeholder="0.000"
                                            required
                                            disabled={saveLoading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cluster
                                    </label>
                                    <select
                                        name="cluster"
                                        value={formData.cluster}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                        disabled={saveLoading}
                                    >
                                        <option value="cluster_0">Cluster 0 (RTH Rendah)</option>
                                        <option value="cluster_1">Cluster 1 (RTH Menengah)</option>
                                        <option value="cluster_2">Cluster 2 (RTH Tinggi)</option>
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                                        disabled={saveLoading}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={saveLoading}
                                    >
                                        {saveLoading ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Menyimpan...
                                            </div>
                                        ) : (
                                            editingItem ? 'Update' : 'Simpan'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RthManagement;