const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `geojson-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) === '.geojson' || file.mimetype === 'application/json') {
            cb(null, true);
        } else {
            cb(new Error('Hanya file GeoJSON (.geojson/.json) yang diperbolehkan'), false);
        }
    }
});

module.exports = upload;