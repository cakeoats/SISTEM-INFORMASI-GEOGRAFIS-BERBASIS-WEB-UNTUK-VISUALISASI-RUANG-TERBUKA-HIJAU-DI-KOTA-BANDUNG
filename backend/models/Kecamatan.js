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
}, { strict: false });

module.exports = mongoose.model('Kecamatan', KecamatanSchema, 'kecamatan');