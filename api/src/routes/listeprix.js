const express = require('express');    
const router = express.Router();    
const listePrixController = require('../controllers/listePrixController');    
const { authenticateToken } = require('../middleware/authMiddleware');    
    
// Routes publiques    
router.get('/', listePrixController.getAllListePrix);    
  
// CRITIQUE: Mettre /active-prices AVANT /:id  
router.get('/active-prices', listePrixController.getActivePrices);  
  
// Cette route doit venir APRÈS les routes spécifiques  
router.get('/:id', listePrixController.getListePrixById);    
    
// Routes protégées    
router.post('/', authenticateToken, listePrixController.createListePrix);    
router.put('/:id', authenticateToken, listePrixController.updateListePrix);    
router.delete('/:id', authenticateToken, listePrixController.deleteListePrix);    
  
router.post('/:id/prix', authenticateToken, listePrixController.addPrixToListe);    
router.put('/:id/prix/:prixId', authenticateToken, listePrixController.updatePrixInListe);    
router.delete('/:id/prix/:prixId', authenticateToken, listePrixController.removePrixFromListe);    
router.get('/:id/prix', listePrixController.getPrixByListe);  
    
module.exports = router;