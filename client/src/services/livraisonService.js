import api from './api';    
    
const livraisonService = {    
  // Démarrer une livraison depuis une planification    
  async startLivraison(planificationId, deliveryData = {}) {    
    try {    
      const { latitude, longitude, details } = deliveryData;    
          
      const response = await api.post(`/livraisons/start/${planificationId}`, {    
        latitude,    
        longitude,    
        details    
      });    
          
      return response.data;    
    } catch (error) {    
      console.error('Erreur démarrage livraison:', error);    
      throw error;    
    }    
  },    
    
  // Terminer une livraison    
  async completeLivraison(livraisonId, completionData) {    
    try {    
      const {    
        latitude,    
        longitude,    
        details,    
        signature_client,    
        photo_livraison,    
        commentaires_livreur,    
        commentaires_client,    
        evaluation_client,    
        etat = 'LIVRE' // LIVRE, ECHEC, PARTIELLE    
      } = completionData;    
    
      const response = await api.put(`/livraisons/${livraisonId}/complete`, {    
        latitude,    
        longitude,    
        details,    
        signature_client,    
        photo_livraison,    
        commentaires_livreur,    
        commentaires_client,    
        evaluation_client,    
        etat    
      });    
    
      return response.data;    
    } catch (error) {    
      console.error('Erreur finalisation livraison:', error);    
      throw error;    
    }    
  },    
    
  // Obtenir toutes les livraisons avec filtres - CORRIGÉ    
  async getLivraisons(params = {}) {    
    try {    
      const {    
        page = 1,    
        limit = 20,    
        etat,    
        planificationId,    
        dateFrom,    
        dateTo,    
        livreur_employee_id   
      } = params;  
    
      const response = await api.get('/livraisons', {    
        params: {    
          page,    
          limit,    
          etat,    
          planificationId,    
          dateFrom,    
          dateTo,    
          livreur_employee_id  // ← AJOUTÉ - maintenant envoyé à l'API  
        }    
      });    
    
      // Transformer les données pour le frontend    
      const transformedData = response.data.data?.map(livraison => ({  
        id: livraison._id,  
        planificationId: livraison.planification_id?._id,  
        date: livraison.date,  
        etat: livraison.etat,  
        latitude: livraison.latitude,  
        longitude: livraison.longitude,  
        total: livraison.total,  
        total_ttc: livraison.total_ttc,  
        total_tva: livraison.total_tva,  
        details: livraison.details,  
        commentaires_livreur: livraison.commentaires_livreur,  
        commentaires_client: livraison.commentaires_client,  
        evaluation_client: livraison.evaluation_client,  
          
        // Données complètes de la commande  
        commande_id: livraison.planification_id?.commande_id ? {  
          _id: livraison.planification_id.commande_id._id,  
          numero_commande: livraison.planification_id.commande_id.numero_commande,  
          montant_total: livraison.planification_id.commande_id.montant_total,  
          date_commande: livraison.planification_id.commande_id.date_commande,  
          details: livraison.planification_id.commande_id.details,  
            
          // Données client complètes  
          customer_id: livraison.planification_id.commande_id.customer_id,  
            
          // Données adresse complètes    
          address_id: livraison.planification_id.commande_id.address_id,  
            
          // Lignes de commande  
          lignes: livraison.planification_id.commande_id.lignes || []  
        } : null,  
          
        // Données planification  
        delivery_date: livraison.planification_id?.delivery_date,  
        priority: livraison.planification_id?.priority,  
        livreur_employee_id: livraison.planification_id?.livreur_employee_id,  
        trucks_id: livraison.planification_id?.trucks_id,  
          
        createdAt: livraison.createdAt,  
        updatedAt: livraison.updatedAt  
      })) || [];  
    
      return {    
        data: transformedData,    
        total: response.data.count || 0,    
        pagination: response.data.pagination || {}    
      };    
    } catch (error) {    
      console.error('Erreur récupération livraisons:', error);    
      throw error;    
    }    
  },    
    
  // Obtenir une livraison par ID    
  async getLivraisonById(livraisonId) {    
    try {    
      const response = await api.get(`/livraisons/${livraisonId}`);    
      const livraison = response.data.data.livraison;    
      const lignes = response.data.data.lignes || [];    
    
      return {    
        id: livraison._id,    
        planificationId: livraison.planification_id?._id,    
        date: livraison.date,    
        etat: livraison.etat,    
        latitude: livraison.latitude,    
        longitude: livraison.longitude,    
        total: livraison.total,    
        total_ttc: livraison.total_ttc,    
        total_tva: livraison.total_tva,    
        details: livraison.details,    
        signature_client: livraison.signature_client,    
        photo_livraison: livraison.photo_livraison,    
        commentaires_livreur: livraison.commentaires_livreur,    
        commentaires_client: livraison.commentaires_client,    
        evaluation_client: livraison.evaluation_client,    
        // Données enrichies    
        commande: livraison.planification_id?.commande_id || null,    
        camion: livraison.planification_id?.trucks_id || null,    
        livreur: livraison.planification_id?.livreur_employee_id || null,    
        // Lignes de livraison    
        lignes: lignes.map(ligne => ({    
          id: ligne._id,    
          quantity: ligne.quantity,    
          price: ligne.price,    
          total_ligne: ligne.total_ligne,    
          etat_ligne: ligne.etat_ligne,    
          notes: ligne.notes,    
          product: ligne.product_id ? {    
            id: ligne.product_id._id,    
            ref: ligne.product_id.ref,    
            nom: ligne.product_id.long_name || ligne.product_id.short_name,    
            brand: ligne.product_id.brand    
          } : null,    
          unite: ligne.UM_id ? {    
            id: ligne.UM_id._id,    
            nom: ligne.UM_id.unitemesure    
          } : null    
        })),    
        createdAt: livraison.createdAt,    
        updatedAt: livraison.updatedAt    
      };    
    } catch (error) {    
      console.error('Erreur récupération livraison:', error);    
      throw error;    
    }    
  },    
    
  // Mettre à jour les lignes de livraison    
  async updateLivraisonLines(livraisonId, lignes) {    
    try {    
      const response = await api.put(`/livraisons/${livraisonId}/lines`, {    
        lignes: lignes.map(ligne => ({    
          product_id: ligne.product_id,    
          UM_id: ligne.UM_id,    
          quantity: ligne.quantity,    
          price: ligne.price,    
          etat_ligne: ligne.etat_ligne || 'LIVRE',    
          notes: ligne.notes || ''    
        }))    
      });    
    
      return response.data;    
    } catch (error) {    
      console.error('Erreur mise à jour lignes livraison:', error);    
      throw error;    
    }    
  },    
    
  // Obtenir les livraisons d'aujourd'hui    
  async getTodayLivraisons() {    
    try {    
      const today = new Date();    
      const dateFrom = today.toISOString().split('T')[0];    
      const dateTo = dateFrom;    
    
      return await this.getLivraisons({ dateFrom, dateTo });    
    } catch (error) {    
      console.error('Erreur récupération livraisons du jour:', error);    
      throw error;    
    }    
  },    
    
  // Obtenir les livraisons en cours    
  async getActiveLivraisons() {    
    try {    
      return await this.getLivraisons({ etat: 'EN_COURS' });    
    } catch (error) {    
      console.error('Erreur récupération livraisons actives:', error);    
      throw error;    
    }    
  },    
    
  // Obtenir les livraisons par planification    
  async getLivraisonsByPlanification(planificationId) {    
    try {    
      return await this.getLivraisons({ planificationId });    
    } catch (error) {    
      console.error('Erreur récupération livraisons par planification:', error);    
      throw error;    
    }    
  },    
    
  // Obtenir les statistiques des livraisons    
  async getLivraisonsStats() {    
    try {    
      const response = await api.get('/livraisons/stats');    
      return response.data.data;    
    } catch (error) {    
      console.error('Erreur récupération statistiques livraisons:', error);    
      // Retourner des stats par défaut en cas d'erreur    
      return {    
        total: 0,    
        en_cours: 0,    
        livrees: 0,    
        echecs: 0,    
        partielles: 0    
      };    
    }    
  },    
    
  // Mapper les états de livraison pour l'affichage    
  mapEtatToDisplay(etat) {    
    const mapping = {    
      'EN_COURS': 'En cours',    
      'LIVRE': 'Livrée',    
      'ECHEC': 'Échec',    
      'PARTIELLE': 'Partielle',    
      'ANNULE': 'Annulée'    
    };    
    return mapping[etat] || etat;    
  },    
    
  // Obtenir la couleur pour l'état    
  getEtatColor(etat) {    
    const colors = {    
      'EN_COURS': 'blue',    
      'LIVRE': 'green',    
      'ECHEC': 'red',    
      'PARTIELLE': 'orange',    
      'ANNULE': 'gray'    
    };    
    return colors[etat] || 'gray';    
  },    
    
  // Valider les données de livraison    
  validateLivraisonData(data) {    
    const errors = [];    
    
    if (!data.planificationId) {    
      errors.push('ID de planification requis');    
    }    
    
    if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {    
      errors.push('Latitude invalide');    
    }    
    
    if (data.longitude && (data.longitude < -180 || data.longitude > 180)) {    
      errors.push('Longitude invalide');    
    }    
    
    if (data.evaluation_client && (data.evaluation_client < 1 || data.evaluation_client > 5)) {    
      errors.push('Évaluation client doit être entre 1 et 5');    
    }    
    
    return {    
      isValid: errors.length === 0,    
      errors    
    };    
  },    
    
  // Calculer la distance entre deux points GPS    
  calculateDistance(lat1, lon1, lat2, lon2) {    
    const R = 6371; // Rayon de la Terre en km    
    const dLat = (lat2 - lat1) * Math.PI / 180;    
    const dLon = (lon2 - lon1) * Math.PI / 180;    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +    
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *    
              Math.sin(dLon/2) * Math.sin(dLon/2);    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));    
    return R * c; // Distance en km    
  }    
};    
    
export default livraisonService;