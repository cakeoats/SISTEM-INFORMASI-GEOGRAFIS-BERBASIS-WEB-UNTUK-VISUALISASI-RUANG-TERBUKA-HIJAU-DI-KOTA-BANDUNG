// frontend/src/components/RthManagement.jsx - Updated dengan Download Excel dan Reset Filter
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import ExcelDataLoader from './ExcelDataLoader';
import { API_BASE_URL } from '../config';

const RthManagement = () => {
    const [rthData, setRthData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [downloadLoading, setDownloadLoading] = useState(false);

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
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_BASE_URL}/api/rth-kecamatan`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

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
            setError(null);
        } catch (err) {
            console.error('Error fetching RTH data:', err);
            setError('Gagal mengambil data RTH: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk download data ke Excel
    const downloadToExcel = () => {
        try {
            setDownloadLoading(true);

            // Siapkan data untuk export (gunakan filtered data atau semua data)
            const dataToExport = filteredData.length > 0 ? filteredData : rthData;

            if (dataToExport.length === 0) {
                alert('Tidak ada data untuk didownload');
                setDownloadLoading(false);
                return;
            }

            // Format data untuk Excel
            const excelData = dataToExport.map((item, index) => ({
                'No': index + 1,
                'Kecamatan': item.kecamatan,
                'Luas Taman (ha)': parseFloat(item.luas_taman).toFixed(3),
                'Luas Pemakaman (ha)': parseFloat(item.luas_pemakaman).toFixed(3),
                'Total RTH (ha)': parseFloat(item.total_rth).toFixed(3),
                'Luas Kecamatan (ha)': parseFloat(item.luas_kecamatan).toFixed(0),
                'Persentase RTH (%)': item.luas_kecamatan > 0 ?
                    ((item.total_rth / item.luas_kecamatan) * 100).toFixed(2) : '0.00',
                'Cluster': item.cluster
            }));

            // Tambahkan baris total di akhir
            const totalRow = {
                'No': '',
                'Kecamatan': 'TOTAL',
                'Luas Taman (ha)': safeReduce(dataToExport, 'luas_taman').toFixed(3),
                'Luas Pemakaman (ha)': safeReduce(dataToExport, 'luas_pemakaman').toFixed(3),
                'Total RTH (ha)': safeReduce(dataToExport, 'total_rth').toFixed(3),
                'Luas Kecamatan (ha)': safeReduce(dataToExport, 'luas_kecamatan').toFixed(0),
                'Persentase RTH (%)': safeReduce(dataToExport, 'luas_kecamatan') > 0 ?
                    ((safeReduce(dataToExport, 'total_rth') / safeReduce(dataToExport, 'luas_kecamatan')) * 100).toFixed(2) : '0.00',
                'Cluster': ''
            };

            excelData.push(totalRow);

            // Buat workbook dan worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Set lebar kolom
            const columnWidths = [
                { wch: 5 },  // No
                { wch: 20 }, // Kecamatan
                { wch: 18 }, // Luas Taman
                { wch: 20 }, // Luas Pemakaman
                { wch: 15 }, // Total RTH
                { wch: 20 }, // Luas Kecamatan
                { wch: 18 }, // Persentase RTH
                { wch: 15 }  // Cluster
            ];
            worksheet['!cols'] = columnWidths;

            // Tambahkan worksheet ke workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Data RTH Admin');

            // Generate filename dengan timestamp
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const filterInfo = selectedCluster !== 'all' || searchTerm ? '_filtered' : '';
            const filename = `Data_RTH_Admin_${timestamp}${filterInfo}.xlsx`;

            // Download file
            XLSX.writeFile(workbook, filename);

            // Tampilkan notifikasi sukses
            alert(`Data berhasil didownload: ${filename}\n\nTotal data: ${dataToExport.length} kecamatan`);

        } catch (error) {
            console.error('Error downloading Excel:', error);
            alert('Gagal mendownload data. Silakan coba lagi.');
        } finally {
            setDownloadLoading(false);
        }
    };

    // Helper function untuk menghitung total dengan safe handling
    const safeReduce = (array, field) => {
        if (!array || !Array.isArray(array)) return 0;
        return array.reduce((sum, item) => {
            const value = parseFloat(item[field]) || 0;
            return sum + value;
        }, 0);
    };

    // Reset semua filter
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCluster('all');
        setSortConfig({ key: null, direction: 'ascending' });
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

        try {
            const token = localStorage.getItem('adminToken');
            const submitData = {
                kecamatan: formData.kecamatan.trim(),
                luas_taman: parseFloat(formData.luas_taman),
                luas_pemakaman: parseFloat(formData.luas_pemakaman),
                total_rth: parseFloat(formData.total_rth),
                luas_kecamatan: parseFloat(formData.luas_kecamatan),
                cluster: formData.cluster
            };

            if (editingItem) {
                // Update existing item
                await axios.put(`${API_BASE_URL}/api/rth-kecamatan/${editingItem.id}`, submitData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                alert('Data berhasil diperbarui');
            } else {
                // Create new item
                await axios.post(`${API_BASE_URL}/api/rth-kecamatan`, submitData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                alert('Data berhasil ditambahkan');
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
        if (window.confirm(`Apakah Anda yakin ingin menghapus data ${item.kecamatan}?`)) {
            try {
                const token = localStorage.getItem('adminToken');
                await axios.delete(`${API_BASE_URL}/api/rth-kecamatan/${item.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                alert('Data berhasil dihapus');
                fetchRthData();
            } catch (err) {
                console.error('Error deleting data:', err);
                alert('Gagal menghapus data: ' + (err.response?.data?.message || err.message));
            }
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
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                    + Tambah Data RTH
                </button>
            </div>

            {/* Excel Data Loader */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Upload Data Excel</h3>
                <ExcelDataLoader onDataLoaded={fetchRthData} />
            </div>

            {/* Filters dengan Download Button */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="grid md:grid-cols-4 gap-4">
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Download Data
                        </label>
                        <button
                            onClick={downloadToExcel}
                            disabled={downloadLoading || !rthData.length}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                        >
                            {downloadLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    Download Excel
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Filter Status */}
                {(selectedCluster !== 'all' || searchTerm || sortConfig.key) && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="font-medium text-blue-700">Filter aktif:</span>
                            {selectedCluster !== 'all' && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                    Cluster: {selectedCluster}
                                    <button
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                        onClick={() => setSelectedCluster('all')}
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {searchTerm && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                    Pencarian: "{searchTerm}"
                                    <button
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {sortConfig.key && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                    Urutan: {sortConfig.key} {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                    <button
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                        onClick={() => setSortConfig({ key: null, direction: 'ascending' })}
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            <button
                                className="text-blue-700 hover:text-blue-900 underline ml-auto text-sm"
                                onClick={resetFilters}
                            >
                                Reset Semua Filter
                            </button>
                        </div>
                        <div className="mt-2 text-sm text-blue-600">
                            Menampilkan {filteredData.length} dari {rthData.length} data.
                            Download akan menggunakan data yang sedang ditampilkan.
                        </div>
                    </div>
                )}
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
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="text-red-600 hover:text-red-800 font-medium"
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
                                            ? (
                                                <div className="flex flex-col items-center">
                                                    <svg className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p>Tidak ada data yang sesuai dengan filter</p>
                                                    <button
                                                        className="mt-2 text-blue-600 hover:text-blue-800 underline"
                                                        onClick={resetFilters}
                                                    >
                                                        Reset filter
                                                    </button>
                                                </div>
                                            )
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
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md"
                                    >
                                        {editingItem ? 'Update' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Download Information Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <svg className="h-5 w-5 text-blue-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">Informasi Download & Filter</h3>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>• <strong>Download Excel:</strong> File akan berisi data yang sedang ditampilkan (sesuai filter aktif)</p>
                            <p>• <strong>Reset Filter:</strong> Menghapus semua filter, pencarian, dan pengurutan yang aktif</p>
                            <p>• <strong>Filter Otomatis:</strong> Data akan difilter secara real-time saat Anda mengetik atau mengubah filter</p>
                            <p>• <strong>Pengurutan:</strong> Klik header kolom untuk mengurutkan data secara ascending/descending</p>
                            <p>• File Excel akan mencakup kolom tambahan: Persentase RTH dan baris total</p>
                            <p>• Nama file: <code className="bg-blue-100 px-1 rounded">Data_RTH_Admin_2025-05-27T10-30-00_filtered.xlsx</code></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Download Status Notification */}
            {downloadLoading && (
                <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
                    <div className="flex items-center">
                        <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div>
                            <p className="font-medium text-gray-800">Sedang memproses download...</p>
                            <p className="text-sm text-gray-600">Mohon tunggu sebentar</p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                    {error}
                </div>
            )}
        </div>
    );
};

export default RthManagement;