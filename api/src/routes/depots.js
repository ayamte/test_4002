const express = require('express');  
const router = express.Router();  
const depotController = require('../controllers/depotController');  
const { authenticateToken } = require('../middleware/authMiddleware');  
  
// Routes pour les dépôts - ORDRE IMPORTANT  
router.get('/', depotController.getAllDepots);  
router.get('/search', depotController.searchDepots); // AVANT /:id  
router.get('/:id', depotController.getDepotById); // APRÈS les routes spécifiques  
router.post('/', authenticateToken, depotController.createDepot);  
router.put('/:id', authenticateToken, depotController.updateDepot);  
router.delete('/:id', authenticateToken, depotController.deleteDepot);  
  
module.exports = router;