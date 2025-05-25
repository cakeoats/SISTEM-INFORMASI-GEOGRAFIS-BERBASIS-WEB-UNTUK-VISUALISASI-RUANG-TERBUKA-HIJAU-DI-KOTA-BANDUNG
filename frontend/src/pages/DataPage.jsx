// frontend/src/pages/DataPage.jsx - Updated untuk menggunakan endpoint public - LENGKAP
import React, { useState, useEffect } from 'react';
import { publicAxios } from '../config';

const DataPage = () => {
    // State untuk menyimpan data
    const [kecamatanData, setKecamatanData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk filter dan pencarian
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCluster, setSelectedCluster] = useState('all');
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'descending'
    });

    // Ambil data dari database saat komponen dimuat
    useEffect(() => {
        fetchData();
    }, []);

    // Fungsi untuk mengambil data dari database - menggunakan endpoint public
    const fetchData = async () => {
        try {
            setLoading(true);
            // Gunakan endpoint public untuk halaman DataPage
            const response = await publicAxios.get('/api/rth-kecamatan/public');

            // Format data dari database untuk UI
            const formattedData = response.data.map((item, index) => ({
                id: item._id || `temp-id-${index}`,
                index: index + 1,
                kecamatan: item.kecamatan || 'Unnamed',
                luas_taman: parseFloat(item.luas_taman) || 0,
                luas_pemakaman: parseFloat(item.luas_pemakaman) || 0,
                total_rth: parseFloat(item.total_rth) || 0,
                luas_kecamatan: parseFloat(item.luas_kecamatan) || 0,
                cluster: item.cluster || 'undefined'
            }));

            setKecamatanData(formattedData);
            setFilteredData(formattedData);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Gagal mengambil data: " + (err.response?.data?.message || err.message));
            setLoading(false);
            // Tetapkan array kosong sebagai fallback
            setKecamatanData([]);
            setFilteredData([]);
        }
    };

    // Effect untuk filter dan sort data ketika ada perubahan filter/search/sort
    useEffect(() => {
        try {
            let result = [...kecamatanData];

            // Filter berdasarkan cluster
            if (selectedCluster !== 'all') {
                result = result.filter(item => item.cluster === selectedCluster);
            }

            // Filter berdasarkan pencarian
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                result = result.filter(item =>
                    (item.kecamatan || '').toLowerCase().includes(searchLower)
                );
            }

            // Pengurutan data
            if (sortConfig.key) {
                result.sort((a, b) => {
                    // Null check
                    if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;

                    // Numeric compare untuk field numerik
                    if (typeof a[sortConfig.key] === 'number' && typeof b[sortConfig.key] === 'number') {
                        return sortConfig.direction === 'ascending'
                            ? a[sortConfig.key] - b[sortConfig.key]
                            : b[sortConfig.key] - a[sortConfig.key];
                    }

                    // String compare untuk field text
                    return sortConfig.direction === 'ascending'
                        ? String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]))
                        : String(b[sortConfig.key]).localeCompare(String(a[sortConfig.key]));
                });
            }

            // Update filtered data
            setFilteredData(result);
        } catch (error) {
            console.error("Error filtering/sorting data:", error);
            // Fallback ke original data jika error
            setFilteredData([...kecamatanData]);
        }
    }, [kecamatanData, searchTerm, selectedCluster, sortConfig]);

    // Fungsi untuk mengganti pengurutan
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Fungsi untuk mendapatkan arah pengurutan saat ini
    const getSortDirection = (key) => {
        if (sortConfig.key !== key) return '';
        return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    };

    // Helper function untuk menghitung total dengan safe handling
    const safeReduce = (array, field) => {
        if (!array || !Array.isArray(array)) return 0;
        return array.reduce((sum, item) => {
            const value = parseFloat(item[field]) || 0;
            return sum + value;
        }, 0);
    };

    // Hitung total dan rata-rata dari SEMUA data (untuk dashboard)
    const totalLuasTamanAll = safeReduce(kecamatanData, 'luas_taman');
    const totalLuasPemakamanAll = safeReduce(kecamatanData, 'luas_pemakaman');
    const totalRthAll = safeReduce(kecamatanData, 'total_rth');
    const totalLuasKecamatanAll = safeReduce(kecamatanData, 'luas_kecamatan');
    const persentaseRthAll = totalLuasKecamatanAll > 0 ? (totalRthAll / totalLuasKecamatanAll) * 100 : 0;

    // Hitung total dan rata-rata dari data yang SUDAH difilter (untuk tabel)
    const totalLuasTaman = safeReduce(filteredData, 'luas_taman');
    const totalLuasPemakaman = safeReduce(filteredData, 'luas_pemakaman');
    const totalRth = safeReduce(filteredData, 'total_rth');
    const totalLuasKecamatan = safeReduce(filteredData, 'luas_kecamatan');

    // Get unique clusters untuk dropdown filter
    const getUniqueClusters = () => {
        if (!kecamatanData || !Array.isArray(kecamatanData)) return ['all'];
        const uniqueClusters = [...new Set(kecamatanData.map(item => item.cluster))].filter(Boolean);
        return ['all', ...uniqueClusters];
    };

    const clusters = getUniqueClusters();

    // Fungsi untuk menentukan warna berdasarkan cluster
    const getClusterColor = (cluster) => {
        switch (cluster) {
            case 'cluster_0':
                return {
                    bg: 'bg-red-500',
                    bgLight: 'bg-red-100',
                    text: 'text-red-800'
                };
            case 'cluster_1':
                return {
                    bg: 'bg-yellow-500',
                    bgLight: 'bg-yellow-100',
                    text: 'text-yellow-800'
                };
            case 'cluster_2':
                return {
                    bg: 'bg-green-500',
                    bgLight: 'bg-green-100',
                    text: 'text-green-800'
                };
            default:
                return {
                    bg: 'bg-gray-500',
                    bgLight: 'bg-gray-100',
                    text: 'text-gray-800'
                };
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
                <p className="mt-2">Loading data...</p>
            </div>
        </div>;
    }

    if (error && (!kecamatanData || kecamatanData.length === 0)) {
        return <div className="container mx-auto px-4 py-6">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
                <button
                    className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    onClick={() => fetchData()}
                >
                    Coba Lagi
                </button>
            </div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">

            {/* Dashboard informasi - SELALU MENAMPILKAN DATA TOTAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Total RTH Publik</h3>
                    <p className="text-3xl font-bold text-green-600">{totalRthAll.toFixed(2)} ha</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Persentase RTH Publik</h3>
                    <p className="text-3xl font-bold text-blue-600">{persentaseRthAll.toFixed(2)}%</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Jumlah Kecamatan</h3>
                    <p className="text-3xl font-bold text-purple-600">{kecamatanData.length || 0}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Target RTH Publik</h3>
                    <div className="flex items-center justify-between">
                        <p className="text-3xl font-bold text-red-600">20%</p>
                        <div className="text-sm text-gray-500">
                            {persentaseRthAll < 20 ?
                                <span className="text-red-500">Belum tercapai</span> :
                                <span className="text-green-500">Tercapai</span>
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter dan Pencarian */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Cari Kecamatan
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                placeholder="Ketik nama kecamatan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filter Cluster */}
                    <div>
                        <label htmlFor="cluster-filter" className="block text-sm font-medium text-gray-700 mb-1">
                            Filter Berdasarkan Cluster
                        </label>
                        <select
                            id="cluster-filter"
                            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            value={selectedCluster}
                            onChange={(e) => setSelectedCluster(e.target.value)}
                        >
                            <option value="all">Semua Cluster</option>
                            {clusters.filter(c => c !== 'all').map((cluster) => (
                                <option key={cluster} value={cluster}>{cluster}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Menampilkan status filter yang aktif */}
                {(selectedCluster !== 'all' || searchTerm) && (
                    <div className="mt-4 p-2 bg-blue-50 rounded text-sm text-blue-700">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="font-medium">Filter aktif:</span>
                            {selectedCluster !== 'all' && (
                                <span className="bg-blue-100 px-2 py-1 rounded-full">
                                    Cluster: {selectedCluster}
                                    <button
                                        className="ml-1 text-blue-500 hover:text-blue-700"
                                        onClick={() => setSelectedCluster('all')}
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {searchTerm && (
                                <span className="bg-blue-100 px-2 py-1 rounded-full">
                                    Kecamatan: "{searchTerm}"
                                    <button
                                        className="ml-1 text-blue-500 hover:text-blue-700"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            <button
                                className="text-blue-700 hover:text-blue-900 underline ml-auto"
                                onClick={() => {
                                    setSelectedCluster('all');
                                    setSearchTerm('');
                                }}
                            >
                                Reset Semua Filter
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabel data RTH */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Data Ruang Terbuka Hijau Publik Kota Bandung</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Data luas taman, pemakaman dan ruang terbuka hijau di setiap kecamatan
                        {filteredData.length !== kecamatanData.length && kecamatanData.length > 0 &&
                            ` (Menampilkan ${filteredData.length} dari ${kecamatanData.length} kecamatan)`}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('kecamatan')}
                                >
                                    Kecamatan {getSortDirection('kecamatan')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('luas_taman')}
                                >
                                    Luas Taman (ha) {getSortDirection('luas_taman')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('luas_pemakaman')}
                                >
                                    Luas Pemakaman (ha) {getSortDirection('luas_pemakaman')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('total_rth')}
                                >
                                    Total RTH (ha) {getSortDirection('total_rth')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('luas_kecamatan')}
                                >
                                    Luas Kecamatan (ha) {getSortDirection('luas_kecamatan')}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('cluster')}
                                >
                                    Cluster {getSortDirection('cluster')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length > 0 ?
                                filteredData.map((data, index) => {
                                    const clusterColor = getClusterColor(data.cluster);

                                    return (
                                        <tr key={data.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{data.kecamatan}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {typeof data.luas_taman === 'number' ? data.luas_taman.toFixed(3) : '0.000'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {typeof data.luas_pemakaman === 'number' ? data.luas_pemakaman.toFixed(3) : '0.000'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {typeof data.total_rth === 'number' ? data.total_rth.toFixed(3) : '0.000'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {typeof data.luas_kecamatan === 'number' ? data.luas_kecamatan.toFixed(0) : '0'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 py-1 rounded-full text-xs ${clusterColor.bgLight} ${clusterColor.text}`}>
                                                    {data.cluster || 'undefined'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                                :
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p>Tidak ada data yang sesuai dengan filter</p>
                                            <button
                                                className="mt-2 text-blue-600 hover:text-blue-800 underline"
                                                onClick={() => {
                                                    setSelectedCluster('all');
                                                    setSearchTerm('');
                                                }}
                                            >
                                                Reset filter
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            }
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900" colSpan="2">Total</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {totalLuasTaman.toFixed(3)}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {totalLuasPemakaman.toFixed(3)}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {totalRth.toFixed(3)}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {totalLuasKecamatan.toFixed(0)}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    -
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Informasi tambahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-4">Distribusi RTH per Cluster</h2>
                    <div className="space-y-4">
                        {/* Cluster distribution - hanya tampilkan jika ada data */}
                        {clusters.filter(c => c !== 'all').length > 0 ?
                            clusters.filter(c => c !== 'all').map((cluster, index) => {
                                const clusterColor = getClusterColor(cluster);
                                const count = kecamatanData.filter(item => item.cluster === cluster).length;

                                return (
                                    <div key={index} className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-2 ${clusterColor.bg}`}></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">{cluster}</span>
                                                <span className="text-sm font-medium text-gray-700">{count} kecamatan</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className={`h-2 rounded-full ${clusterColor.bg}`}
                                                    style={{ width: `${(count / (kecamatanData.length || 1)) * 100}%` }}>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                            :
                            <div className="text-gray-500 text-center py-4">
                                Tidak ada data cluster tersedia
                            </div>
                        }
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-4">Informasi RTH</h2>
                    <p className="text-gray-700 mb-4">
                        Total luas RTH Publik di Kota Bandung saat ini adalah {persentaseRthAll.toFixed(2)}% dari luas wilayah kota.
                        Target yang ditetapkan dalam rencana tata ruang kota adalah 20% sesuai dengan standar nasional.
                    </p>

                    <div className="bg-green-50 p-3 rounded-lg">
                        <h3 className="text-md font-semibold text-green-700 mb-2">Komposisi RTH</h3>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Taman</span>
                            <span className="text-gray-800 font-medium">
                                {totalLuasTamanAll.toFixed(2)} ha
                                ({(totalRthAll > 0 ? (totalLuasTamanAll / totalRthAll * 100) : 0).toFixed(1)}%)
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Pemakaman</span>
                            <span className="text-gray-800 font-medium">
                                {totalLuasPemakamanAll.toFixed(2)} ha
                                ({(totalRthAll > 0 ? (totalLuasPemakamanAll / totalRthAll * 100) : 0).toFixed(1)}%)
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataPage;