const Kecamatan = require('../models/Kecamatan');

exports.getKecamatan = async (req, res) => {
    try {
        console.log('Fetching kecamatan data from MongoDB');

        // Ambil data mentah dari MongoDB
        const kecamatanData = await Kecamatan.find({}).lean();

        console.log(`Found ${kecamatanData.length} kecamatan documents`);

        // Log struktur dokumen pertama untuk debugging
        if (kecamatanData.length > 0) {
            console.log('First document structure:',
                JSON.stringify(Object.keys(kecamatanData[0])));
        }

        // Siapkan struktur GeoJSON yang benar
        const geoJsonData = {
            type: 'FeatureCollection',
            features: []
        };

        // Periksa jika struktur data sesuai dengan screenshot yang Anda berikan
        kecamatanData.forEach(doc => {
            // Jika dokumen memiliki struktur features array
            if (doc.features && Array.isArray(doc.features)) {
                doc.features.forEach(feature => {
                    // Pastikan feature memiliki geometry
                    if (feature && feature.geometry) {
                        // Pastikan properti NAMEOBJ diambil dari lokasi yang tepat
                        let name = 'Unknown';

                        // Cek jika ada properties.NAMEOBJ
                        if (feature.properties && feature.properties.NAMEOBJ) {
                            name = feature.properties.NAMEOBJ;
                        }
                        // Pastikan memeriksa juga WADMKC yang berisi nama kecamatan (dari screenshot)
                        else if (feature.properties && feature.properties.WADMKC) {
                            name = feature.properties.WADMKC;
                        }

                        geoJsonData.features.push({
                            type: 'Feature',
                            properties: {
                                name: name,
                                // Tambahkan properti lain yang mungkin berguna
                                id: feature.properties?.OBJECTID || feature.properties?.ID || null,
                                kode: feature.properties?.FCODE || null
                            },
                            geometry: feature.geometry
                        });
                    }
                });
            }
            // Jika dokumen sendiri adalah feature
            else if (doc.geometry) {
                let name = 'Unknown';

                // Cek jika ada properties.NAMEOBJ
                if (doc.properties && doc.properties.NAMEOBJ) {
                    name = doc.properties.NAMEOBJ;
                }
                // Pastikan memeriksa juga WADMKC yang berisi nama kecamatan (dari screenshot)
                else if (doc.properties && doc.properties.WADMKC) {
                    name = doc.properties.WADMKC;
                }

                geoJsonData.features.push({
                    type: 'Feature',
                    properties: {
                        name: name,
                        // Tambahkan properti lain yang mungkin berguna
                        id: doc.properties?.OBJECTID || doc.properties?.ID || null,
                        kode: doc.properties?.FCODE || null
                    },
                    geometry: doc.geometry
                });
            }
        });

        console.log(`Transformed to ${geoJsonData.features.length} GeoJSON features`);
        // Log contoh feature pertama jika ada
        if (geoJsonData.features.length > 0) {
            console.log('Sample feature:',
                JSON.stringify(geoJsonData.features[0].properties));
        }

        res.json(geoJsonData);
    } catch (err) {
        console.error('Error in getKecamatan:', err);
        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};