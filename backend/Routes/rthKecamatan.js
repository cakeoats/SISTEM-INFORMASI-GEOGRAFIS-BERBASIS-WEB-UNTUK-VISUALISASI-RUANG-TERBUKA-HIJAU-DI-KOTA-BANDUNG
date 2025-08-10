// backend/Routes/rthKecamatan.js
const express = require('express');
const router = express.Router();
const rthKecamatanController = require('../controllers/rthKecamatanController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// PENTING: Public route HARUS di atas protected routes
router.get('/public', rthKecamatanController.getAllRthKecamatan);

// Protected routes
router.get('/', verifyToken, requireAdmin, rthKecamatanController.getAllRthKecamatan);
router.post('/bulk', verifyToken, requireAdmin, rthKecamatanController.bulkSaveRthKecamatan);
router.post('/', verifyToken, requireAdmin, rthKecamatanController.addRthKecamatan);
router.put('/:id', verifyToken, requireAdmin, rthKecamatanController.updateRthKecamatan);
router.delete('/:id', verifyToken, requireAdmin, rthKecamatanController.deleteRthKecamatan);

module.exports = router;