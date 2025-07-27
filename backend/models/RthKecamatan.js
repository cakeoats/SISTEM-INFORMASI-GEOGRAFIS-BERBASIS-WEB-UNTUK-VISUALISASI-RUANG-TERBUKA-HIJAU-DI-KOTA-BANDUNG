const mongoose = require('mongoose');

// Schema untuk data RTH per kecamatan
const RthKecamatanSchema = new mongoose.Schema({
    kecamatan: {
        type: String,
        required: true, // Nama kecamatan wajib diisi
        trim: true // Hapus whitespace di awal/akhir
    },
    luas_taman: {
        type: Number,
        default: 0 // Default 0 jika tidak ada data taman
    },
    luas_pemakaman: {
        type: Number,
        default: 0 // Default 0 jika tidak ada data pemakaman
    },
    total_rth: {
        type: Number,
        default: 0 // Default 0 jika tidak ada data total RTH
    },
    luas_kecamatan: {
        type: Number,
        default: 0 // Default 0 jika tidak ada data luas kecamatan
    },
    cluster: {
        type: String,
        default: 'cluster_0' // Default cluster untuk klasifikasi
    },
    tanggal_update: {
        type: Date,
        default: Date.now // Timestamp kapan data terakhir diupdate
    }
});

// Export model dengan collection name 'rth_kecamatan'
module.exports = mongoose.model('RthKecamatan', RthKecamatanSchema, 'rth_kecamatan');