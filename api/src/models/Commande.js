const mongoose = require('mongoose');      
require('./Customer');  
require('./Address');  
      
const CommandeSchema = new mongoose.Schema({      
  // ✅ Référence vers le client (équivalent à user_id dans vos specs)  
  customer_id: {   
    type: mongoose.Schema.Types.ObjectId,   
    ref: 'Customer',   
    required: true   
  },  
    
  // ✅ Référence vers une adresse du système unifié  
  address_id: {   
    type: mongoose.Schema.Types.ObjectId,   
    ref: 'Address',   
    required: true   
  },  
    
  // ✅ Date de commande (correspond à votre spec)  
  date_commande: {   
    type: Date,   
    default: Date.now   
  },  
    
  // ✅ Statut de la commande (correspond à votre spec)  
  statut: {     
    type: String,     
    enum: ['EN_ATTENTE', 'CONFIRMEE', 'PLANIFIEE', 'EN_COURS', 'LIVREE', 'ANNULEE'],     
    default: 'EN_ATTENTE'     
  },  
    
  // ✅ Montant total (correspond à votre spec)  
  montant_total: {  
    type: Number,  
    required: true,  
    min: 0  
  },  
    
  // Champs additionnels pour la gestion  
  numero_commande: {   
    type: String,   
    unique: true   
  },  
    
  date_souhaite: Date,  
    
  mode_paiement: {     
    type: String,     
    enum: ['ESPECES'],     
    default: 'ESPECES'     
  },  
    
  urgent: {   
    type: Boolean,   
    default: false   
  },  
    
  details: {   
    type: String   
  }  
    
}, { timestamps: true });      
    
// Générer automatiquement un numéro de commande si non fourni    
CommandeSchema.pre('save', async function(next) {    
  if (!this.numero_commande) {    
    const count = await mongoose.model('Commande').countDocuments();    
    this.numero_commande = `CMD${String(count + 1).padStart(6, '0')}`;    
  }    
  next();    
});    
    
// Index pour les performances  
CommandeSchema.index({ customer_id: 1 });      
CommandeSchema.index({ date_commande: -1 });    
CommandeSchema.index({ address_id: 1 });  
CommandeSchema.index({ statut: 1 });    
CommandeSchema.index({ numero_commande: 1 });    
      
module.exports = mongoose.model('Commande', CommandeSchema);