const mongoose = require('mongoose');

// Skema GeoJSON untuk MultiPolygon
const GeoSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['MultiPolygon'],
        required: true
    },
    coordinates: {
        type: [[[[Number]]]],  // Format untuk MultiPolygon
        required: true
    }
});

// Skema untuk Kecamatan
const KecamatanSchema = new mongoose.Schema({
    // Kita tidak mendefinisikan struktur secara ketat karena data GeoJSON bisa kompleks
}, { strict: false });

module.exports = mongoose.model('Kecamatan', KecamatanSchema, 'kecamatan');