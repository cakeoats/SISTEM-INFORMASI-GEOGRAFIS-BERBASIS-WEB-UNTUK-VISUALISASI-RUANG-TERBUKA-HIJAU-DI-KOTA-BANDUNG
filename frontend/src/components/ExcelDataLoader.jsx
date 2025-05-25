// frontend/src/components/ExcelDataLoader.jsx - Updated untuk admin dashboard
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ExcelDataLoader = ({ onDataLoaded }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saveStatus, setSaveStatus] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setSaveStatus(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Pastikan angka dibaca dengan benar, paksa raw: true untuk mendapatkan nilai asli
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    defval: 0,
                    raw: true
                });

                console.log("Data Excel mentah:", jsonData);

                // Proses data untuk menangani format angka dengan benar
                const processedData = jsonData.map(row => {
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

                        // Deteksi kolom berdasarkan header
                        if (key.toUpperCase().includes('KECAMATAN') && !key.toUpperCase().includes('LUAS')) {
                            processedRow.kecamatan = String(value).trim();
                        }
                        else if (key.toUpperCase().includes('LUAS') && key.toUpperCase().includes('TAMAN')) {
                            // Pastikan nilai numerik
                            processedRow.luas_taman = parseFloat(String(value).replace(',', '.'));
                        }
                        else if (key.toUpperCase().includes('LUAS') && key.toUpperCase().includes('PEMAKAMAN')) {
                            processedRow.luas_pemakaman = parseFloat(String(value).replace(',', '.'));
                        }
                        else if (key.toUpperCase().includes('TOTAL') && key.toUpperCase().includes('RTH')) {
                            processedRow.total_rth = parseFloat(String(value).replace(',', '.'));
                        }
                        else if (key.toUpperCase().includes('LUAS') && key.toUpperCase().includes('KECAMATAN')) {
                            processedRow.luas_kecamatan = parseFloat(String(value).replace(',', '.'));
                        }
                        else if (key.toUpperCase().includes('CLUSTER')) {
                            processedRow.cluster = String(value).trim();
                        }
                    });

                    // Tambahkan log untuk debug
                    console.log("Row after processing:", processedRow);

                    return processedRow;
                });

                // Log untuk debugging
                console.log("Processed data:", processedData);

                // Simpan ke database
                saveToDatabase(processedData);
            } catch (error) {
                console.error("Error processing Excel file:", error);
                setError("Gagal memproses file Excel. Pastikan format file benar.");
                setLoading(false);
            }
        };

        reader.onerror = () => {
            setError("Gagal membaca file.");
            setLoading(false);
        };

        reader.readAsArrayBuffer(file);
    };

    const saveToDatabase = async (dbData) => {
        try {
            console.log("Data yang akan dikirim ke database:", dbData);

            const token = localStorage.getItem('adminToken');
            const response = await axios.post(`${API_BASE_URL}/api/rth-kecamatan/bulk`, {
                data: dbData
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSaveStatus({
                success: true,
                message: `${response.data.count} data berhasil disimpan ke database`
            });

            // Panggil callback untuk refresh data
            if (onDataLoaded) {
                onDataLoaded();
            }

            setLoading(false);
        } catch (error) {
            console.error("Error saving to database:", error);
            setSaveStatus({
                success: false,
                message: `Gagal menyimpan ke database: ${error.response?.data?.message || error.message}`
            });

            setLoading(false);
        }
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
                        Pilih file Excel (.xlsx atau .xls)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Format kolom: KECAMATAN, LUAS TAMAN, LUAS PEMAKAMAN, TOTAL RTH, LUAS KECAMATAN, CLUSTER
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
                    <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            {saveStatus && (
                <div className={`border rounded-lg p-3 ${saveStatus.success
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    <div className="flex items-center">
                        {saveStatus.success ? (
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {saveStatus.message}
                    </div>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3">
                <div className="flex items-start">
                    <svg className="h-4 w-4 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm">
                        <p className="font-medium mb-1">Tips Upload Excel:</p>
                        <ul className="text-xs space-y-1">
                            <li>• Pastikan file Excel memiliki header di baris pertama</li>
                            <li>• Header harus mengandung kata kunci: KECAMATAN, LUAS TAMAN, LUAS PEMAKAMAN, TOTAL RTH, LUAS KECAMATAN, CLUSTER</li>
                            <li>• Data numerik menggunakan titik (.) sebagai pemisah desimal</li>
                            <li>• Upload akan mengganti semua data yang ada sebelumnya</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExcelDataLoader;