// chronogaz_back/utils/gpsTracker.js
const Livraison = require('../models/Livraison');
const UserAddress = require('../models/UserAddress');
const Address = require('../models/Address');

// Fonction pour enregistrer et diffuser une position GPS
const updateDriverPosition = async (livraisonId, latitude, longitude, io) => {
  try {
    const livraison = await Livraison.findById(livraisonId)
      .populate({
        path: 'planification_id',
        populate: {
          path: 'livreur_id',
          populate: {
            path: 'physical_user_id'
          }
        }
      });

    if (!livraison) {
      throw new Error('Livraison non trouvée');
    }

    const livreurId = livraison.planification_id.livreur_id.physical_user_id._id;

    // Mettre à jour l'adresse du livreur
    const userAddress = await UserAddress.findOne({
      physical_user_id: livreurId,
      is_principal: false
    }).populate('address_id');

    if (userAddress && userAddress.address_id) {
      userAddress.address_id.latitude = parseFloat(latitude);
      userAddress.address_id.longitude = parseFloat(longitude);
      userAddress.address_id.updatedAt = new Date();
      await userAddress.address_id.save();
    } else {
      // Créer une nouvelle adresse de position
      const nouvelleAdresse = new Address({
        rue: 'Position en temps réel',
        ville: 'En transit',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        type_adresse: 'TRAVAIL'
      });
      
      const adresseSauvee = await nouvelleAdresse.save();
      
      const nouvelleUserAddress = new UserAddress({
        physical_user_id: livreurId,
        address_id: adresseSauvee._id,
        is_principal: false
      });
      
      await nouvelleUserAddress.save();
    }

    // Diffuser la mise à jour via WebSocket
    if (io && io.broadcastToDelivery) {
      io.broadcastToDelivery(livraisonId, 'position_updated', {
        deliveryId: livraisonId,
        position: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        },
        timestamp: new Date().toISOString()
      });
    }

    return {
      success: true,
      position: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    };

  } catch (error) {
    console.error('Erreur mise à jour position:', error);
    throw error;
  }
};

// Fonction pour récupérer la dernière position d'un livreur
const getLastDriverPosition = async (livraisonId) => {
  try {
    const livraison = await Livraison.findById(livraisonId)
      .populate({
        path: 'planification_id',
        populate: {
          path: 'livreur_id',
          populate: {
            path: 'physical_user_id'
          }
        }
      });

    if (!livraison) {
      return null;
    }

    const livreurId = livraison.planification_id.livreur_id.physical_user_id._id;

    const userAddress = await UserAddress.findOne({
      physical_user_id: livreurId,
      is_principal: false
    })
    .populate('address_id')
    .sort({ updatedAt: -1 });

    if (userAddress && userAddress.address_id) {
      return {
        latitude: userAddress.address_id.latitude,
        longitude: userAddress.address_id.longitude,
        timestamp: userAddress.address_id.updatedAt
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur récupération position:', error);
    return null;
  }
};

module.exports = {
  updateDriverPosition,
  getLastDriverPosition
};