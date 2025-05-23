const express = require('express');
const router = express.Router();
const kecamatanController = require('../controllers/kecamatanController');

// Public route untuk mendapatkan data kecamatan
router.get('/public', kecamatanController.getKecamatan);

// Protected route untuk admin
router.get('/', kecamatanController.getKecamatan);

module.exports = router;