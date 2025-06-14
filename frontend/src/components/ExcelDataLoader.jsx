// frontend/src/components/ExcelDataLoader.jsx - Complete dengan Toast Notifications
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { showToast } from '../utils/toast';

const ExcelDataLoader = ({ onDataLoaded }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset states
        setLoading(true);
        setError(null);
        setUploadProgress(null);

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            setError('File harus berformat Excel (.xlsx atau .xls)');
            showToast.error('File harus berformat Excel (.xlsx atau .xls)');
            setLoading(false);
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Ukuran file maksimal 5MB');
            showToast.error('Ukuran file maksimal 5MB');
            setLoading(false);
            return;
        }

        const loadingToast = showToast.loading('Memproses file Excel...');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];

                if (!sheetName) {
                    throw new Error('File Excel tidak memiliki worksheet');
                }

                const worksheet = workbook.Sheets[sheetName];

                // Pastikan angka dibaca dengan benar, paksa raw: true untuk mendapatkan nilai asli
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    defval: 0,
                    raw: true
                });

                if (!jsonData || jsonData.length === 0) {
                    throw new Error('File Excel kosong atau tidak memiliki data');
                }

                console.log("Data Excel mentah:", jsonData);
                showToast.info(`Membaca ${jsonData.length} baris data dari Excel`);

                // Proses data untuk menangani format angka dengan benar
                const processedData = jsonData.map((row, index) => {
                    // Buat objek baru dengan nilai default untuk setiap kolom
                    const processedRow = {
                        kecamatan: '',
                        luas_taman: 0,
                        luas_pemakaman: 0,
                        total_rth: 0,
                        luas_kecamatan: 0,
                        cluster: 'cluster_0'
                    };

                    // Cari kolom yang sesuai di Excel
                    Object.keys(row).forEach(key => {
                        let value = row[key];

                        // Skip jika value null atau undefined
                        if (value === null || value === undefined) return;

                        // Deteksi kolom berdasarkan header
                        const keyUpper = key.toUpperCase();

                        if (keyUpper.includes('KECAMATAN') && !keyUpper.includes('LUAS')) {
                            processedRow.kecamatan = String(value).trim();
                        }
                        else if (keyUpper.includes('LUAS') && keyUpper.includes('TAMAN')) {
                            // Pastikan nilai numerik
                            const numValue = parseFloat(String(value).replace(/[,\s]/g, '.'));
                            processedRow.luas_taman = isNaN(numValue) ? 0 : numValue;
                        }
                        else if (keyUpper.includes('LUAS') && keyUpper.includes('PEMAKAMAN')) {
                            const numValue = parseFloat(String(value).replace(/[,\s]/g, '.'));
                            processedRow.luas_pemakaman = isNaN(numValue) ? 0 : numValue;
                        }
                        else if (keyUpper.includes('TOTAL') && keyUpper.includes('RTH')) {
                            const numValue = parseFloat(String(value).replace(/[,\s]/g, '.'));
                            processedRow.total_rth = isNaN(numValue) ? 0 : numValue;
                        }
                        else if (keyUpper.includes('LUAS') && keyUpper.includes('KECAMATAN')) {
                            const numValue = parseFloat(String(value).replace(/[,\s]/g, '.'));
                            processedRow.luas_kecamatan = isNaN(numValue) ? 0 : numValue;
                        }
                        else if (keyUpper.includes('CLUSTER')) {
                            processedRow.cluster = String(value).trim();
                        }
                    });

                    // Validasi data
                    if (!processedRow.kecamatan) {
                        console.warn(`Baris ${index + 1}: Nama kecamatan kosong`);
                    }

                    return processedRow;
                });

                // Filter data yang valid (memiliki nama kecamatan)
                const validData = processedData.filter(item => item.kecamatan);

                if (validData.length === 0) {
                    throw new Error('Tidak ada data valid yang ditemukan. Pastikan kolom KECAMATAN terisi.');
                }

                if (validData.length < processedData.length) {
                    showToast.warning(`${processedData.length - validData.length} baris diabaikan karena tidak memiliki nama kecamatan`);
                }

                console.log("Processed valid data:", validData);
                showToast.success(`${validData.length} data valid siap diupload`);

                // Simpan ke database
                saveToDatabase(validData);
            } catch (error) {
                console.error("Error processing Excel file:", error);
                const errorMessage = `Gagal memproses file Excel: ${error.message}`;
                setError(errorMessage);
                showToast.error(errorMessage);
                setLoading(false);
            }
        };

        reader.onerror = () => {
            const errorMessage = "Gagal membaca file Excel";
            setError(errorMessage);
            showToast.error(errorMessage);
            setLoading(false);
        };

        reader.readAsArrayBuffer(file);
    };

    const saveToDatabase = async (dbData) => {
        const uploadToast = showToast.loading(`Mengupload ${dbData.length} data ke database...`);

        try {
            console.log("Data yang akan dikirim ke database:", dbData);
            setUploadProgress(`Mengupload ${dbData.length} data...`);

            const token = localStorage.getItem('adminToken');

            if (!token) {
                throw new Error('Token admin tidak ditemukan. Silakan login kembali.');
            }

            const response = await axios.post(`${API_BASE_URL}/api/rth-kecamatan/bulk`, {
                data: dbData
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            });

            const successMessage = `${response.data.count || dbData.length} data berhasil disimpan ke database`;
            setUploadProgress(successMessage);

            showToast.data.uploaded(response.data.count || dbData.length);

            // Panggil callback untuk refresh data
            if (onDataLoaded) {
                onDataLoaded();
            }

            // Auto-hide progress after success
            setTimeout(() => {
                setUploadProgress(null);
            }, 3000);

        } catch (error) {
            console.error("Error saving to database:", error);

            let errorMessage = 'Gagal menyimpan ke database';

            if (error.response) {
                // Server responded with error
                if (error.response.status === 401) {
                    errorMessage = 'Sesi login telah berakhir. Silakan login kembali.';
                } else if (error.response.status === 413) {
                    errorMessage = 'Data terlalu besar untuk diupload. Coba dengan file yang lebih kecil.';
                } else if (error.response.status >= 500) {
                    errorMessage = 'Server sedang bermasalah. Silakan coba lagi nanti.';
                } else {
                    errorMessage = error.response.data?.message || errorMessage;
                }
            } else if (error.request) {
                // Network error
                errorMessage = 'Koneksi bermasalah. Periksa internet Anda.';
            } else if (error.code === 'ECONNABORTED') {
                // Timeout error
                errorMessage = 'Upload timeout. File terlalu besar atau koneksi lambat.';
            }

            setError(errorMessage);
            showToast.error(errorMessage);
            setUploadProgress(null);
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    const clearFile = () => {
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
        setError(null);
        setUploadProgress(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    Upload Data Excel RTH Kecamatan
                </label>
                {loading && (
                    <div className="flex items-center text-sm text-blue-500">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                    </div>
                )}
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                    type="file"
                    accept=".xlsx, .xls"
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
                        <div className="flex space-x-2 ml-4">
                            <button
                                onClick={clearError}
                                className="text-red-600 hover:text-red-800 text-xs underline"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={clearFile}
                                className="text-red-600 hover:text-red-800 text-xs underline"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tips Section */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3">
                <div className="flex items-start">
                    <svg className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm">
                        <p className="font-medium mb-1">Tips Upload Excel:</p>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                            <li>Pastikan file Excel memiliki header di baris pertama</li>
                            <li>Header harus mengandung kata kunci: KECAMATAN, LUAS TAMAN, LUAS PEMAKAMAN, TOTAL RTH, LUAS KECAMATAN, CLUSTER</li>
                            <li>Data numerik menggunakan titik (.) sebagai pemisah desimal</li>
                            <li>Kolom KECAMATAN wajib diisi untuk setiap baris</li>
                            <li>Upload akan mengganti semua data yang ada sebelumnya</li>
                            <li>File maksimal 5MB dengan format .xlsx atau .xls</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Example Format Section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800 mb-2">Contoh Format Excel:</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="bg-green-100">
                                <th className="px-2 py-1 text-left border border-green-200">KECAMATAN</th>
                                <th className="px-2 py-1 text-left border border-green-200">LUAS TAMAN</th>
                                <th className="px-2 py-1 text-left border border-green-200">LUAS PEMAKAMAN</th>
                                <th className="px-2 py-1 text-left border border-green-200">TOTAL RTH</th>
                                <th className="px-2 py-1 text-left border border-green-200">LUAS KECAMATAN</th>
                                <th className="px-2 py-1 text-left border border-green-200">CLUSTER</th>
                            </tr>
                        </thead>
                        <tbody className="text-green-700">
                            <tr>
                                <td className="px-2 py-1 border border-green-200">Andir</td>
                                <td className="px-2 py-1 border border-green-200">12.500</td>
                                <td className="px-2 py-1 border border-green-200">8.750</td>
                                <td className="px-2 py-1 border border-green-200">21.250</td>
                                <td className="px-2 py-1 border border-green-200">1650</td>
                                <td className="px-2 py-1 border border-green-200">cluster_0</td>
                            </tr>
                            <tr>
                                <td className="px-2 py-1 border border-green-200">Antapani</td>
                                <td className="px-2 py-1 border border-green-200">15.300</td>
                                <td className="px-2 py-1 border border-green-200">10.200</td>
                                <td className="px-2 py-1 border border-green-200">25.500</td>
                                <td className="px-2 py-1 border border-green-200">1820</td>
                                <td className="px-2 py-1 border border-green-200">cluster_1</td>
                            </tr>
                            <tr>
                                <td className="px-2 py-1 border border-green-200">Arcamanik</td>
                                <td className="px-2 py-1 border border-green-200">18.750</td>
                                <td className="px-2 py-1 border border-green-200">12.430</td>
                                <td className="px-2 py-1 border border-green-200">31.180</td>
                                <td className="px-2 py-1 border border-green-200">1990</td>
                                <td className="px-2 py-1 border border-green-200">cluster_2</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Advanced Tips Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                    <svg className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Catatan Penting:</p>
                        <ul className="text-xs space-y-1">
                            <li>• Sistem akan otomatis mendeteksi header berdasarkan kata kunci</li>
                            <li>• Baris dengan kecamatan kosong akan diabaikan</li>
                            <li>• Data yang tidak valid akan ditampilkan notifikasi warning</li>
                            <li>• Proses upload akan menghapus semua data RTH yang ada sebelumnya</li>
                            <li>• Pastikan backup data sebelum melakukan upload jika diperlukan</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Success Message Template */}
            {!loading && !error && !uploadProgress && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <span className="text-sm">Pilih file Excel untuk mulai upload data RTH</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelDataLoader;