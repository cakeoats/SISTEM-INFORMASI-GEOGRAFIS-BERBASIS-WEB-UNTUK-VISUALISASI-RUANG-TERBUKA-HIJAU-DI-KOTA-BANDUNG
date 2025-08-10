// backend/models/RthKecamatan.js
const mongoose = require('mongoose');

const RthKecamatanSchema = new mongoose.Schema({
    kecamatan: {
        type: String,
        required: true,
        trim: true
    },
    luas_taman: {
        type: Number,
        default: 0
    },
    luas_pemakaman: {
        type: Number,
        default: 0
    },
    total_rth: {
        type: Number,
        default: 0
    },
    luas_kecamatan: {
        type: Number,
        default: 0
    },
    cluster: {
        type: String,
        default: 'cluster_0'
    },
    tanggal_update: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RthKecamatan', RthKecamatanSchema, 'rth_kecamatan');