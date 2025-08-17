const mongoose = require('mongoose');  
  
const LivraisonSchema = new mongoose.Schema({  
  // Référence à la planification  
  planification_id: {   
    type: mongoose.Schema.Types.ObjectId,   
    ref: 'Planification',   
    required: true   
  },  
    
  // Date réelle de livraison  
  date: {   
    type: Date,   
    required: true,  
    default: Date.now  
  },  
    
  // Références aux employés et camion  
  livreur_employee_id: {   
    type: mongoose.Schema.Types.ObjectId,   
    ref: 'Employe',   
    required: true   
  },  
  trucks_id: {   
    type: mongoose.Schema.Types.ObjectId,   
    ref: 'Truck',   
    required: true   
  },  
    
  // État de la livraison  
  etat: {  
    type: String,  
    enum: ['EN_COURS', 'LIVRE', 'ANNULE', 'PARTIELLE', 'ECHEC'],  
    default: 'EN_COURS'  
  },  
    
  // Adresse de livraison  
  adress: {  
    street: String,  
    city: String,  
    postal_code: String,  
    quartier: String,  
    instructions: String  
  },  
    
  // Coordonnées GPS  
  longitude: {  
    type: Number,  
    min: -180,  
    max: 180  
  },  
  latitude: {  
    type: Number,  
    min: -90,  
    max: 90  
  },  
    
  // Montants financiers  
  total: {  
    type: Number,  
    min: 0  
  },  
  total_ttc: {  
    type: Number,  
    min: 0  
  },  
  total_tva: {  
    type: Number,  
    min: 0,  
    default: 0  
  },  
    
  // Informations supplémentaires  
  details: String,  
    
  // Champs pour le suivi  
  signature_client: Buffer,  
  photo_livraison: String,  
  commentaires_livreur: String,  
  commentaires_client: String,  
  evaluation_client: {  
    type: Number,  
    min: 1,  
    max: 5  
  }  
    
}, { timestamps: true });  
  
// Index pour optimiser les requêtes  
LivraisonSchema.index({ planification_id: 1 });  
LivraisonSchema.index({ date: -1 });  
LivraisonSchema.index({ etat: 1 });  
LivraisonSchema.index({ livreur_employee_id: 1 });  
  
module.exports = mongoose.model('Livraison', LivraisonSchema);