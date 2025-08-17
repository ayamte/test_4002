const mongoose = require('mongoose');      
require('../models/Commande');    
require('../models/Truck');    
require('../models/Employe');    
      
const PlanificationSchema = new mongoose.Schema({ 
  commande_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Commande', required: true },    
  delivery_date: { type: Date, required: true }, // Renommé de 'date_planifiee'    
  livreur_employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe', required: false }, 
  trucks_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },    
  etat: {     
    type: String,     
    enum: ['PLANIFIE', 'EN_COURS', 'LIVRE', 'ANNULE', 'REPORTE'],     
    default: 'PLANIFIE'     
  },   
  orderdelivery: { type: Number, default: 1 }, 

  priority: {    
    type: String,    
    enum: ['low', 'medium', 'high', 'urgent'],    
    default: 'medium'    
  },  
   
  accompagnateur_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe' },    
  date_debut_reel: Date,    
  date_fin_reel: Date,    
  commentaires: String,    
}, { timestamps: true });      
      

PlanificationSchema.index({ commande_id: 1 });      
PlanificationSchema.index({ trucks_id: 1 });      
PlanificationSchema.index({ delivery_date: 1 });    
PlanificationSchema.index({ livreur_employee_id: 1 });    
PlanificationSchema.index({ etat: 1 });    
PlanificationSchema.index({ priority: 1 }); 
      
module.exports = mongoose.model('Planification', PlanificationSchema);