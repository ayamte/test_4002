// routes/truckRoutes.js
const express = require('express');
const router = express.Router();
const {createTruck, getTrucks, getTruck, updateTruck, deleteTruck} = require('../controllers/truckController');

// Route pour la création d'un camion
router.post('/', createTruck);

// Routes pour la récupération de tous les camions ou d'un camion spécifique
router.get('/', getTrucks);
router.get('/:id', getTruck);

// Route pour la mise à jour d'un camion
router.put('/:id', updateTruck);
router.patch('/:id', updateTruck); // On peut aussi utiliser PATCH pour des mises à jour partielles

// Route pour la suppression d'un camion
router.delete('/:id', deleteTruck);

module.exports = router;