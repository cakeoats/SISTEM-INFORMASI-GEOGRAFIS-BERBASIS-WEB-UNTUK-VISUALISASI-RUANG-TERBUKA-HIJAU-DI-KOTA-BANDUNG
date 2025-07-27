import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // Library untuk parsing Excel files
import axios from 'axios'; // HTTP client
import { API_BASE_URL } from '../config'; // Base URL config
import { showToast } from '../utils/toast'; // Toast notifications

const ExcelDataLoader = ({ onDataLoaded }) => {
    // State management untuk upload process
    const [loading, setLoading] = useState(false); // Loading state saat upload
    const [error, setError] = useState(null); // Error state untuk menampilkan error
    const [uploadProgress, setUploadProgress] = useState(null); // Progress message

    // Handler untuk file upload event
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset states sebelum memulai upload
        setLoading(true);
        setError(null);
        setUploadProgress(null);

        // Validasi tipe file - hanya accept Excel files
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            setError('File harus berformat Excel (.xlsx atau .xls)');
            setLoading(false);
            showToast.error('Format file tidak didukung');
            return;
        }

        // Validasi ukuran file - maksimal 5MB
        if (file.size > 5 * 1024 * 1024) {
            setError('Ukuran file maksimal 5MB');
            setLoading(false);
            showToast.error('File terlalu besar');
            return;
        }

        // Update progress message
        setUploadProgress('Membaca file Excel...');

        // FileReader untuk membaca file
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                // Parse Excel file menggunakan XLSX
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Ambil worksheet pertama
                const worksheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[worksheetName];

                // Convert ke JSON dengan header di baris pertama
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1, // Gunakan array of arrays
                    defval: '' // Default value untuk cell kosong
                });

                // Validasi data dan kirim ke server
                await processExcelData(jsonData);

            } catch (parseError) {
                console.error('Error parsing Excel:', parseError);
                setError('Gagal membaca file Excel. Pastikan format file benar.');
                showToast.error('Error parsing Excel file');
            } finally {
                setLoading(false);
                setUploadProgress(null);
            }
        };

        reader.onerror = () => {
            setError('Gagal membaca file');
            setLoading(false);
            setUploadProgress(null);
            showToast.error('File read error');
        };

        // Mulai membaca file
        reader.readAsArrayBuffer(file);
    };

    // Function untuk memproses data Excel dan kirim ke server
    const processExcelData = async (rawData) => {
        try {
            if (!rawData || rawData.length < 2) {
                throw new Error('File Excel kosong atau tidak memiliki data');
            }

            setUploadProgress('Memvalidasi data...');

            // Ambil header dari baris pertama
            const headers = rawData[0];

            // Validasi kolom yang diperlukan
            const requiredColumns = ['KECAMATAN', 'LUAS TAMAN', 'LUAS PEMAKAMAN', 'TOTAL RTH', 'LUAS KECAMATAN', 'CLUSTER'];
            const missingColumns = requiredColumns.filter(col =>
                !headers.some(header =>
                    header && header.toString().toUpperCase().includes(col)
                )
            );

            if (missingColumns.length > 0) {
                throw new Error(`Kolom yang hilang: ${missingColumns.join(', ')}`);
            }

            // Mapping header ke index
            const columnMapping = {};
            requiredColumns.forEach(reqCol => {
                const index = headers.findIndex(header =>
                    header && header.toString().toUpperCase().includes(reqCol)
                );
                columnMapping[reqCol] = index;
            });

            setUploadProgress('Memproses data...');

            // Convert data ke format yang dibutuhkan
            const processedData = [];
            for (let i = 1; i < rawData.length; i++) {
                const row = rawData[i];

                // Skip baris kosong
                if (!row || row.every(cell => !cell && cell !== 0)) continue;

                const kecamatan = row[columnMapping['KECAMATAN']];
                if (!kecamatan) continue; // Skip jika tidak ada nama kecamatan

                const rowData = {
                    kecamatan: kecamatan.toString().trim(),
                    luas_taman: parseFloat(row[columnMapping['LUAS TAMAN']]) || 0,
                    luas_pemakaman: parseFloat(row[columnMapping['LUAS PEMAKAMAN']]) || 0,
                    total_rth: parseFloat(row[columnMapping['TOTAL RTH']]) || 0,
                    luas_kecamatan: parseFloat(row[columnMapping['LUAS KECAMATAN']]) || 0,
                    cluster: row[columnMapping['CLUSTER']] || 'cluster_0'
                };

                processedData.push(rowData);
            }

            if (processedData.length === 0) {
                throw new Error('Tidak ada data valid yang ditemukan');
            }

            setUploadProgress('Mengirim data ke server...');

            // Kirim data ke backend
            const token = localStorage.getItem('adminToken');
            const response = await axios.post(
                `${API_BASE_URL}/api/rth-kecamatan/bulk`,
                { data: processedData },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                showToast.success(`${processedData.length} data berhasil diimport`);
                if (onDataLoaded) onDataLoaded(); // Callback untuk refresh data
            } else {
                throw new Error(response.data.message || 'Upload gagal');
            }

        } catch (error) {
            console.error('Error processing Excel data:', error);
            setError(error.message || 'Gagal memproses data Excel');
            showToast.error(error.message || 'Upload failed');
        }
    };

    return (
        <div className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={loading}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100
                        disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Upload Instructions */}
                <div className="mt-2">
                    <p className="text-sm text-gray-600">
                        Pilih file Excel (.xlsx atau .xls) - Maksimal 5MB
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Format kolom: KECAMATAN, LUAS TAMAN, LUAS PEMAKAMAN, TOTAL RTH, LUAS KECAMATAN, CLUSTER
                    </p>
                </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3">
                    <div className="flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {uploadProgress}
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center">
                            <svg className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">{error}</span>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-600 hover:text-red-800 text-xs underline ml-4"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelDataLoader;