const mongoose = require('mongoose');   
require('./Product');  
require('./Um');  
    
const CommandeLineSchema = new mongoose.Schema({    
  commande_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Commande', required: true },    
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },    
  UM_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Um', required: true }, // Renommé selon votre spec  
  quantity: { type: Number, required: true }, // Renommé de 'quantite'  
  price: { type: Number, required: true }, // Prix de la ligne (renommé de 'prix_unitaire')  
}, { timestamps: true });    
    
CommandeLineSchema.index({ commande_id: 1 });    
CommandeLineSchema.index({ product_id: 1 });    
    
module.exports = mongoose.model('CommandeLine', CommandeLineSchema);