const Command = require('../models/Commande');    
const CommandeLine = require('../models/CommandeLine');    
const Planification = require('../models/Planification');    
const Livraison = require('../models/Livraison');    
const LivraisonLine = require('../models/LivraisonLine');    
const Address = require('../models/Address');    
const UserAddress = require('../models/UserAddress');    
const Customer = require('../models/Customer');    
const City = require('../models/City');     
const Product = require('../models/Product');    
const Um = require('../models/Um');    
const mongoose = require('mongoose');    
const Truck = require('../models/Truck');
  
// Récupérer toutes les commandes avec filtres  
const getCommands = async (req, res) => {    
  try {    
    const { page = 1, limit = 20, status, search, priority, dateFrom, dateTo, customerId } = req.query;    
        
    const filter = {};    
    const skip = (parseInt(page) - 1) * parseInt(limit);    
        
    // ✅ MODIFIÉ: Filtre basé sur l'état de planification au lieu de statut    
    if (status && status !== 'all') {    
      const statusToPlanificationState = {    
        'pending': null,  
        'assigned': 'PLANIFIE',    
        'in_progress': 'EN_COURS',     
        'delivered': 'LIVRE',    
        'cancelled': 'ANNULE'    
      };    
          
      if (status === 'pending') {    
        const commandsWithPlanification = await Planification.distinct('commande_id');    
        filter._id = { $nin: commandsWithPlanification };    
      } else {    
        const planificationsIds = await Planification.find({     
          etat: statusToPlanificationState[status]     
        }).distinct('commande_id');    
        filter._id = { $in: planificationsIds };    
      }    
    }    
        
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {    
      filter.customer_id = customerId;    
    }    
        
    if (search) {    
      filter.$or = [    
        { numero_commande: { $regex: search, $options: 'i' } }    
      ];    
    }    
        
    if (dateFrom || dateTo) {    
      filter.date_commande = {};    
      if (dateFrom) {    
        filter.date_commande.$gte = new Date(dateFrom);    
      }    
      if (dateTo) {    
        filter.date_commande.$lte = new Date(dateTo);    
      }    
    }    
        
    // ✅ MODIFIÉ: Filtre de priorité basé sur la planification    
    if (priority && priority !== 'all') {    
      const planificationsIds = await Planification.find({     
        priority: priority     
      }).distinct('commande_id');    
          
      if (filter._id) {    
        filter._id = { $in: filter._id.$in ?     
          filter._id.$in.filter(id => planificationsIds.includes(id.toString())) :     
          planificationsIds     
        };    
      } else {    
        filter._id = { $in: planificationsIds };    
      }    
    }    
    
    const commandes = await Command.find(filter)    
      .populate({    
        path: 'customer_id',    
        select: 'customer_code type_client physical_user_id moral_user_id',    
        populate: [    
          {    
            path: 'physical_user_id',    
            select: 'first_name last_name telephone_principal'    
          },    
          {    
            path: 'moral_user_id',    
            select: 'raison_sociale telephone_principal'    
          }    
        ]    
      })    
      .populate({    
        path: 'address_id',    
        select: 'street numappt numimmeuble quartier city_id latitude longitude',    
        populate: [    
          {    
            path: 'city_id',    
            select: 'name code'    
          }    
        ]    
      })    
      .sort({ date_commande: -1 })    
      .skip(skip)    
      .limit(parseInt(limit));    
    
    const count = await Command.countDocuments(filter);    
    
    // Enrichir avec les planifications et livraisons    
    const commandesComplete = await Promise.all(    
      commandes.map(async (commande) => {    
        const planification = await Planification.findOne({ commande_id: commande._id })    
          .populate('trucks_id', 'matricule marque capacite')    
          .populate({    
            path: 'livreur_employee_id',    
            select: 'matricule fonction physical_user_id',    
            populate: {    
              path: 'physical_user_id',    
              select: 'first_name last_name'    
            }    
          });    
    
        const livraison = planification ?     
          await Livraison.findOne({ planification_id: planification._id }) : null;    
    
        const lignesCount = await CommandeLine.countDocuments({ commande_id: commande._id });    
    
        return {    
          ...commande.toObject(),    
          planification,    
          livraison,    
          total_articles: lignesCount    
        };    
      })    
    );    
    
    res.status(200).json({    
      success: true,    
      count: count,    
      data: commandesComplete,    
      pagination: {    
        current_page: parseInt(page),    
        total_pages: Math.ceil(count / parseInt(limit)),    
        total_items: count,    
        items_per_page: parseInt(limit)    
      }    
    });    
    
  } catch (error) {    
    console.error('Erreur lors de la récupération des commandes:', error);    
    res.status(500).json({    
      success: false,    
      message: error.message    
    });    
  }    
};    
  
// Récupérer une commande par ID  
const getCommandById = async (req, res) => {  
  try {  
    const { id } = req.params;  
      
    if (!mongoose.Types.ObjectId.isValid(id)) {  
      return res.status(400).json({  
        success: false,  
        message: 'ID de commande invalide'  
      });  
    }  
      
    const command = await Command.findById(id)  
      .populate({  
        path: 'customer_id',  
        select: 'customer_code type_client physical_user_id moral_user_id',  
        populate: [  
          {  
            path: 'physical_user_id',  
            select: 'first_name last_name telephone_principal'  
          },  
          {  
            path: 'moral_user_id',  
            select: 'raison_sociale telephone_principal'  
          }  
        ]  
      })  
      .populate({  
        path: 'address_id',  
        select: 'street numappt numimmeuble quartier city_id latitude longitude telephone instructions_livraison',  
        populate: [  
          {  
            path: 'city_id',  
            select: 'name code'  
          }  
        ]  
      });  
  
    if (!command) {  
      return res.status(404).json({  
        success: false,  
        message: 'Commande non trouvée'  
      });  
    }  
  
    const lignesCommande = await CommandeLine.find({ commande_id: id })  
      .populate('product_id', 'ref long_name short_name brand gamme prix')  
      .populate('UM_id', 'unitemesure');  
  
    const planification = await Planification.findOne({ commande_id: id })  
      .populate('trucks_id', 'matricule marque')  
      .populate({  
        path: 'livreur_employee_id',  
        select: 'matricule fonction physical_user_id',  
        populate: {  
          path: 'physical_user_id',  
          select: 'first_name last_name'  
        }  
      })  
      .populate({  
        path: 'accompagnateur_id',  
        select: 'matricule physical_user_id',  
        populate: {  
          path: 'physical_user_id',  
          select: 'first_name last_name'  
        }  
      });  
  
    res.status(200).json({  
      success: true,  
      data: {  
        command,  
        lignes: lignesCommande,  
        planification  
      }  
    });  
  
  } catch (error) {  
    console.error('Erreur lors de la récupération de la commande:', error);  
    res.status(500).json({  
      success: false,  
      message: error.message  
    });  
  }  
};  
  
// Créer une nouvelle commande  
const createCommand = async (req, res) => {  
  try {  
    const {  
      customer_id,  
      address,  
      details,  
      urgent,  
      lignes,  
      date_souhaite  
    } = req.body;  
  
    if (!customer_id) {  
      return res.status(400).json({  
        success: false,  
        message: 'Le champ customer_id est obligatoire'  
      });  
    }  
  
    if (!lignes || !Array.isArray(lignes) || lignes.length === 0) {  
      return res.status(400).json({  
        success: false,  
        message: 'Au moins une ligne de commande est requise'  
      });  
    }  
  
    const customer = await Customer.findById(customer_id);  
    if (!customer) {  
      return res.status(400).json({  
        success: false,  
        message: 'Client non trouvé'  
      });  
    }  
  
    let finalAddressId;  
  
    if (address.use_existing_address && address.address_id) {  
      finalAddressId = address.address_id;  
        
      const userAddress = await UserAddress.findOne({  
        [customer.type_client === 'PHYSIQUE' ? 'physical_user_id' : 'moral_user_id']:   
          customer.type_client === 'PHYSIQUE' ? customer.physical_user_id : customer.moral_user_id,  
        address_id: finalAddressId  
      });  
  
      if (!userAddress) {  
        return res.status(400).json({  
          success: false,  
          message: 'Adresse non autorisée pour ce client'  
        });  
      }  
    } else if (address.new_address) {  
      const casablancaCity = await City.findOne({ name: 'Casablanca' });  
        
      const newAddress = new Address({  
        user_id: customer_id,  
        street: address.new_address.street,  
        numappt: address.new_address.numappt,  
        numimmeuble: address.new_address.numimmeuble,  
        quartier: address.new_address.quartier,  
        city_id: casablancaCity?._id,  
        postal_code: address.new_address.postal_code,  
        type_adresse: address.new_address.type_adresse || 'LIVRAISON',  
        latitude: address.new_address.latitude,  
        longitude: address.new_address.longitude,  
        telephone: address.new_address.telephone,  
        instructions_livraison: address.new_address.instructions_livraison  
      });  
  
      const savedAddress = await newAddress.save();  
      finalAddressId = savedAddress._id;  
  
      const userAddress = new UserAddress({  
        [customer.type_client === 'PHYSIQUE' ? 'physical_user_id' : 'moral_user_id']:   
          customer.type_client === 'PHYSIQUE' ? customer.physical_user_id : customer.moral_user_id,  
        address_id: finalAddressId,  
        is_principal: false  
      });  
      await userAddress.save();  
    } else {  
      return res.status(400).json({  
        success: false,  
        message: 'Informations d\'adresse manquantes'  
      });  
    }  
  
    for (const ligne of lignes) {  
      if (!ligne.product_id || !ligne.UM_id || !ligne.quantity || !ligne.price) {  
        return res.status(400).json({  
          success: false,  
          message: 'Chaque ligne doit contenir product_id, UM_id, quantity et price'  
        });  
      }  
  
      const product = await Product.findById(ligne.product_id);  
      if (!product) {  
        return res.status(400).json({  
          success: false,  
          message: `Produit non trouvé: ${ligne.product_id}`  
        });  
      }  
  
      const um = await Um.findById(ligne.UM_id);  
      if (!um) {  
        return res.status(400).json({  
          success: false,  
          message: `Unité de mesure non trouvée: ${ligne.UM_id}`  
        });  
      }  
    }  
  
    let montant_total = lignes.reduce((total, ligne) => {  
      return total + (ligne.quantity * ligne.price);  
    }, 0);  
  
    const fraisLivraison = 20;  
    montant_total += fraisLivraison;  
  
    const nouvelleCommande = new Command({  
      customer_id: new mongoose.Types.ObjectId(customer_id),  
      address_id: finalAddressId,  
      details,  
      urgent: urgent || false,  
      montant_total,  
      date_souhaite: date_souhaite ? new Date(date_souhaite) : null  
    });  
  
    const commandeSauvegardee = await nouvelleCommande.save();  
  
    const lignesCommande = lignes.map(ligne => ({  
      commande_id: commandeSauvegardee._id,  
      product_id: ligne.product_id,  
      UM_id: ligne.UM_id,  
      quantity: ligne.quantity,  
      price: ligne.price  
    }));  
  
    await CommandeLine.insertMany(lignesCommande);  
  
    const commandeComplete = await Command.findById(commandeSauvegardee._id)  
      .populate('customer_id', 'customer_code type_client')  
      .populate({  
        path: 'address_id',  
        select: 'street numappt numimmeuble quartier city_id latitude longitude',  
        populate: [  
          {  
            path: 'city_id',  
            select: 'name code'  
          }  
        ]  
      });  
  
    res.status(201).json({  
      success: true,  
      message: 'Commande créée avec succès',  
      data: commandeComplete  
    });  
  
  } catch (error) {  
    console.error('Erreur lors de la création de la commande:', error);  
    res.status(500).json({  
      success: false,  
      message: error.message  
    });  
  }  
};  
  
// ✅ CORRIGÉ: Annuler une commande basé sur la planification  
const cancelOrder = async (req, res) => {    
  try {    
    const { id } = req.params;    
    const { raison_annulation } = req.body;    
    
    if (!mongoose.Types.ObjectId.isValid(id)) {    
      return res.status(400).json({    
        success: false,    
        message: 'ID de commande invalide'    
      });    
    }    
    
    const commande = await Command.findById(id);    
    if (!commande) {    
      return res.status(404).json({    
        success: false,    
        message: 'Commande non trouvée'    
      });    
    }    
    
    // ✅ CORRIGÉ: Vérifier l'état de la planification au lieu du statut de commande  
    const planification = await Planification.findOne({ commande_id: id });  
      
    if (planification) {  
      // Vérifier si la planification peut être annulée  
      const etatsNonAnnulables = ['EN_COURS', 'LIVRE'];  
      if (etatsNonAnnulables.includes(planification.etat)) {  
        return res.status(400).json({  
          success: false,  
          message: `Impossible d'annuler une commande avec une planification "${planification.etat}"`  
        });  
      }  
        
      // Vérifier s'il y a une livraison en cours  
      const livraison = await Livraison.findOne({   
        planification_id: planification._id,  
        etat: 'EN_COURS'  
      });  
        
      if (livraison) {  
        return res.status(400).json({  
          success: false,  
          message: 'Impossible d\'annuler une commande avec une livraison en cours'  
        });  
      }  
        
      // Marquer la planification comme annulée  
      planification.etat = 'ANNULE';  
      await planification.save();  
    }  
    
    // Mettre à jour les détails de la commande  
    if (raison_annulation) {    
      commande.details = `${commande.details || ''}\nRaison d'annulation: ${raison_annulation}`;    
    }    
    await commande.save();    
    
    res.status(200).json({    
      success: true,    
      message: 'Commande annulée avec succès',    
      data: commande    
    });    
    
  } catch (error) {    
    console.error('Erreur lors de l\'annulation de la commande:', error);    
    res.status(500).json({    
      success: false,    
      message: error.message    
    });    
  }    
};    
  
// Récupérer les commandes par client    
const getCommandsByCustomerId = async (req, res) => {    
  try {    
    const { customerId } = req.params;    
        
    if (!mongoose.Types.ObjectId.isValid(customerId)) {    
      return res.status(400).json({    
        success: false,    
        message: 'ID client invalide'    
      });    
    }    
        
    const commands = await Command.find({ customer_id: customerId })    
      .populate({    
        path: 'address_id',    
        select: 'street numappt numimmeuble quartier city_id latitude longitude',    
        populate: [    
          {    
            path: 'city_id',    
            select: 'name code'    
          }    
        ]    
      })    
      .sort({ date_commande: -1 });    
    
    // Enrichir avec les lignes de commande et planifications  
    const commandsWithLines = await Promise.all(    
      commands.map(async (command) => {    
        const lignes = await CommandeLine.find({ commande_id: command._id })    
          .populate('product_id', 'ref long_name short_name brand gamme prix')    
          .populate('UM_id', 'unitemesure');    
  
        // ✅ AJOUTÉ: Récupérer la planification pour chaque commande  
        const planification = await Planification.findOne({ commande_id: command._id })  
          .populate('trucks_id', 'matricule marque')  
          .populate({  
            path: 'livreur_employee_id',  
            select: 'matricule fonction physical_user_id',  
            populate: {  
              path: 'physical_user_id',  
              select: 'first_name last_name'  
            }  
          });  
    
        return {    
          ...command.toObject(),    
          lignes,  
          planification  
        };    
      })    
    );    
    
    res.status(200).json({    
      success: true,    
      data: commandsWithLines    
    });    
    
  } catch (error) {    
    console.error('Erreur récupération commandes client:', error);    
    res.status(500).json({    
      success: false,    
      message: error.message    
    });    
  }    
};    
  
// Mettre à jour une commande    
const updateCommandById = async (req, res) => {    
  try {    
    const { id } = req.params;    
    const updateData = req.body;    
    
    if (!mongoose.Types.ObjectId.isValid(id)) {    
      return res.status(400).json({    
        success: false,    
        message: 'ID de commande invalide'    
      });    
    }    
    
    const commandeMiseAJour = await Command.findByIdAndUpdate(    
      id,    
      updateData,    
      { new: true, runValidators: true }    
    );    
    
    if (!commandeMiseAJour) {    
      return res.status(404).json({    
        success: false,    
        message: 'Commande non trouvée'    
      });    
    }    
    
    const commandeComplete = await Command.findById(id)    
      .populate('customer_id', 'customer_code type_client')    
      .populate({    
        path: 'address_id',    
        select: 'street numappt numimmeuble quartier city_id latitude longitude',    
        populate: [    
          {    
            path: 'city_id',    
            select: 'name code'    
          }    
        ]    
      });    
    
    res.status(200).json({    
      success: true,    
      message: 'Commande mise à jour avec succès',    
      data: commandeComplete    
    });    
    
  } catch (error) {    
    console.error('Erreur lors de la mise à jour de la commande:', error);    
    res.status(500).json({    
      success: false,    
      message: error.message    
    });    
  }    
};    
  
// Mettre à jour le statut d'une commande avec planification    
const updateCommandStatus = async (req, res) => {  
  try {  
    const { id } = req.params;  
    const { truck_id, delivery_date, priority } = req.body; // Retirer accompagnateur_id aussi  
      
    if (!mongoose.Types.ObjectId.isValid(id)) {  
      return res.status(400).json({  
        success: false,  
        message: 'ID de commande invalide'  
      });  
    }  
      
    if (!truck_id || !delivery_date) {  
      return res.status(400).json({  
        success: false,  
        message: 'truck_id et delivery_date sont requis pour planifier la commande'  
      });  
    }  
      
    // Récupérer le camion avec son chauffeur ET son accompagnateur  
    const truck = await Truck.findById(truck_id)  
      .populate('driver')  
      .populate('accompagnant');  
      
    if (!truck) {  
      return res.status(400).json({  
        success: false,  
        message: 'Camion non trouvé'  
      });  
    }  
  
    if (!truck.driver) {  
      return res.status(400).json({  
        success: false,  
        message: 'Ce camion n\'a pas de chauffeur assigné'  
      });  
    }  
  
    // Récupérer automatiquement le chauffeur et l'accompagnateur du camion  
    const livreur_employee_id = truck.driver._id;  
    const accompagnateur_id = truck.accompagnant ? truck.accompagnant._id : null;  
      
    // Vérifier si une planification existe déjà  
    const planificationExistante = await Planification.findOne({ commande_id: id });  
      
    if (planificationExistante) {  
      // Mettre à jour la planification existante  
      planificationExistante.trucks_id = truck_id;  
      planificationExistante.livreur_employee_id = livreur_employee_id;  
      planificationExistante.accompagnateur_id = accompagnateur_id; // Automatique depuis le camion  
      planificationExistante.delivery_date = delivery_date;  
      planificationExistante.priority = priority || 'medium';  
      planificationExistante.etat = 'PLANIFIE';  
        
      await planificationExistante.save();  
        
      return res.status(200).json({  
        success: true,  
        message: 'Planification mise à jour avec succès',  
        data: {  
          planification: planificationExistante  
        }  
      });  
    } else {  
      // Créer une nouvelle planification  
      const nouvellePlanification = new Planification({  
        commande_id: id,  
        trucks_id: truck_id,  
        livreur_employee_id: livreur_employee_id, // Automatique depuis le camion  
        accompagnateur_id: accompagnateur_id, // Automatique depuis le camion  
        delivery_date,  
        priority: priority || 'medium',  
        etat: 'PLANIFIE'  
      });  
        
      await nouvellePlanification.save();  
        
      return res.status(200).json({  
        success: true,  
        message: 'Commande planifiée avec succès',  
        data: {  
          planification: nouvellePlanification  
        }  
      });  
    }  
      
  } catch (error) {  
    console.error('Erreur lors de la planification:', error);  
    res.status(500).json({  
      success: false,  
      message: error.message  
    });  
  }  
};  
  
// ✅ NOUVEAU: Fonction pour annuler une planification    
const cancelPlanification = async (req, res) => {    
  try {    
    const { id } = req.params;    
    
    if (!mongoose.Types.ObjectId.isValid(id)) {    
      return res.status(400).json({    
        success: false,    
        message: 'ID de commande invalide'    
      });    
    }    
    
    const planification = await Planification.findOne({ commande_id: id });    
        
    if (!planification) {    
      return res.status(404).json({    
        success: false,    
        message: 'Aucune planification trouvée pour cette commande'    
      });    
    }    
    
    // Vérifier s'il y a une livraison en cours    
    const livraison = await Livraison.findOne({     
      planification_id: planification._id,    
      etat: 'EN_COURS'    
    });    
    
    if (livraison) {    
      return res.status(400).json({    
        success: false,    
        message: 'Impossible d\'annuler une planification avec une livraison en cours'    
      });    
    }    
    
    // Supprimer la planification    
    await Planification.findByIdAndDelete(planification._id);    
    
    res.status(200).json({    
      success: true,    
      message: 'Planification annulée avec succès'    
    });    
    
  } catch (error) {    
    console.error('Erreur lors de l\'annulation de la planification:', error);    
    res.status(500).json({    
      success: false,    
      message: error.message    
    });    
  }    
};    
  
// Supprimer une commande    
const deleteCommandById = async (req, res) => {    
  try {    
    const { id } = req.params;    
    
    if (!mongoose.Types.ObjectId.isValid(id)) {    
      return res.status(400).json({    
        success: false,    
        message: 'ID de commande invalide'    
      });    
    }    
    
    // Vérifier si la commande existe    
    const commande = await Command.findById(id);    
    if (!commande) {    
      return res.status(404).json({    
        success: false,    
        message: 'Commande non trouvée'    
      });    
    }    
    
    // Supprimer les lignes de commande associées    
    await CommandeLine.deleteMany({ commande_id: id });    
    
    // Supprimer la planification si elle existe    
    await Planification.deleteOne({ commande_id: id });    
  
    // ✅ AJOUTÉ: Supprimer les livraisons associées  
    const planifications = await Planification.find({ commande_id: id });  
    for (const planif of planifications) {  
      await Livraison.deleteMany({ planification_id: planif._id });  
      await LivraisonLine.deleteMany({   
        livraison_id: { $in: await Livraison.find({ planification_id: planif._id }).distinct('_id') }  
      });  
    }  
    
    // Supprimer la commande    
    await Command.findByIdAndDelete(id);    
    
    res.status(200).json({    
      success: true,    
      message: 'Commande supprimée avec succès'    
    });    
    
  } catch (error) {    
    console.error('Erreur lors de la suppression de la commande:', error);    
    res.status(500).json({    
      success: false,    
      message: error.message    
    });    
  }    
};    
  
// ✅ CORRIGÉ: Statistiques basées sur les planifications  
const getCommandsStats = async (req, res) => {    
  try {    
    // Statistiques par état de planification  
    const planificationStats = await Planification.aggregate([    
      {    
        $group: {    
          _id: '$etat',    
          count: { $sum: 1 }    
        }    
      }    
    ]);    
  
    // Commandes sans planification (pending)  
    const commandsWithPlanification = await Planification.distinct('commande_id');  
    const commandsPending = await Command.countDocuments({  
      _id: { $nin: commandsWithPlanification }  
    });  
    
    const totalCommandes = await Command.countDocuments();    
    const commandesUrgentes = await Command.countDocuments({ urgent: true });    
  
    // ✅ AJOUTÉ: Statistiques par priorité  
    const priorityStats = await Planification.aggregate([  
      {  
        $group: {  
          _id: '$priority',  
          count: { $sum: 1 }  
        }  
      }  
    ]);  
    
    // Statistiques par mois (derniers 6 mois)    
    const sixMonthsAgo = new Date();    
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);    
    
    const monthlyStats = await Command.aggregate([    
      {    
        $match: {    
          date_commande: { $gte: sixMonthsAgo }    
        }    
      },    
      {    
        $group: {    
          _id: {    
            year: { $year: '$date_commande' },    
            month: { $month: '$date_commande' }    
          },    
          count: { $sum: 1 },    
          totalAmount: { $sum: '$montant_total' }
        }    
      },    
      {    
        $sort: { '_id.year': 1, '_id.month': 1 }    
      }    
    ]);    
  
    // ✅ CORRIGÉ: Transformer les statistiques pour le frontend  
    const transformedStats = {  
      totalCommandes,  
      commandesUrgentes,  
      pending: commandsPending,  
      assigned: 0,  
      inProgress: 0,  
      delivered: 0,  
      cancelled: 0  
    };  
  
    // Mapper les états de planification vers les statuts frontend  
    planificationStats.forEach(stat => {  
      switch(stat._id) {  
        case 'PLANIFIE':  
          transformedStats.assigned = stat.count;  
          break;  
        case 'EN_COURS':  
          transformedStats.inProgress = stat.count;  
          break;  
        case 'LIVRE':  
          transformedStats.delivered = stat.count;  
          break;  
        case 'ANNULE':  
          transformedStats.cancelled = stat.count;  
          break;  
      }  
    });  
    
    res.status(200).json({    
      success: true,    
      data: {    
        ...transformedStats,  
        repartitionParPlanification: planificationStats,  
        repartitionParPriorite: priorityStats,  
        statistiquesMensuelles: monthlyStats    
      }    
    });    
  } catch (error) {    
    console.error('Erreur lors de la récupération des statistiques:', error);    
    res.status(500).json({    
      success: false,    
      message: error.message    
    });    
  }    
};    
  
// ✅ CORRIGÉ: Statistiques par client basées sur les planifications  
const getCommandsStatsByCustomer = async (req, res) => {    
  try {    
    const { customerId } = req.params;    
    
    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {    
      return res.status(400).json({    
        success: false,    
        message: 'ID client invalide'    
      });    
    }    
  
    // ✅ CORRIGÉ: Statistiques par état de planification pour ce client  
    const commandIds = await Command.find({ customer_id: customerId }).distinct('_id');  
      
    const planificationStatsByCustomer = await Planification.aggregate([  
      {  
        $match: { commande_id: { $in: commandIds } }  
      },  
      {  
        $group: {  
          _id: '$etat',  
          count: { $sum: 1 }  
        }  
      }  
    ]);  
  
    // Commandes sans planification pour ce client  
    const commandsWithPlanification = await Planification.find({  
      commande_id: { $in: commandIds }  
    }).distinct('commande_id');  
      
    const commandsPendingByCustomer = commandIds.filter(  
      id => !commandsWithPlanification.includes(id.toString())  
    ).length;  
    
    const totalCommandes = await Command.countDocuments({ customer_id: customerId });    
    const commandesUrgentes = await Command.countDocuments({    
      customer_id: customerId,    
      urgent: true    
    });    
    
    // Montant total des commandes    
    const montantTotal = await Command.aggregate([    
      {    
        $match: { customer_id: new mongoose.Types.ObjectId(customerId) }    
      },    
      {    
        $group: {    
          _id: null,    
          total: { $sum: '$montant_total' }    
        }    
      }    
    ]);    
  
    // ✅ CORRIGÉ: Transformer les statistiques pour le frontend  
    const transformedStatsByCustomer = {  
      totalCommandes,  
      commandesUrgentes,  
      montantTotal: montantTotal[0]?.total || 0,  
      pending: commandsPendingByCustomer,  
      assigned: 0,  
      inProgress: 0,  
      delivered: 0,  
      cancelled: 0  
    };  
  
    // Mapper les états de planification  
    planificationStatsByCustomer.forEach(stat => {  
      switch(stat._id) {  
        case 'PLANIFIE':  
          transformedStatsByCustomer.assigned = stat.count;  
          break;  
        case 'EN_COURS':  
          transformedStatsByCustomer.inProgress = stat.count;  
          break;  
        case 'LIVRE':  
          transformedStatsByCustomer.delivered = stat.count;  
          break;  
        case 'ANNULE':  
          transformedStatsByCustomer.cancelled = stat.count;  
          break;  
      }  
    });  
    
    res.status(200).json({    
      success: true,    
      data: {  
        ...transformedStatsByCustomer,  
        repartitionParPlanification: planificationStatsByCustomer  
      }  
    });    
    
  } catch (error) {    
    console.error('Erreur lors de la récupération des statistiques client:', error);    
    res.status(500).json({    
      success: false,    
      message: error.message    
    });    
  }    
};    
  
module.exports = {      
  getCommands,      
  getCommandById,      
  getCommandsByCustomerId,      
  createCommand,      
  updateCommandById,      
  updateCommandStatus,  
  cancelPlanification,     
  cancelOrder,      
  deleteCommandById,      
  getCommandsStats,      
  getCommandsStatsByCustomer      
};