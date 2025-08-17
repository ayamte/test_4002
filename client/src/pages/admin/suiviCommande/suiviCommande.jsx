import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Star, 
  StarOff, 
  Phone, 
  MapPin, 
  Calendar,
  Truck,
  User,
  Package,
  X,
  RotateCcw
} from 'lucide-react';
import { orderService } from '../../../services/orderService';
import truckService from '../../../services/truckService';
import { planificationService } from '../../../services/planificationService';
import { livraisonService } from '../../../services/livraisonService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Pagination from '../../../components/common/Pagination';
import "./suiviCommande.css";

export default function OrderTrackingManagement() {
  // États pour les données
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 🔧 NOUVEAU: État pour les villes
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // États pour les filtres - 🔧 MODIFIÉ: region -> ville
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    clientType: 'all',
    ville: 'all', // 🔧 CHANGÉ: region -> ville
    date:''
  });

  // États pour la modal et pagination
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Refs pour la gestion des timeouts
  const searchTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // 🔧 NOUVEAU: Charger les villes depuis l'API
  const loadCities = async () => {
    try {
      setLoadingCities(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/locations/cities`);
      const data = await response.json();
      
      if (data.success) {
        setCities(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  // 🔧 CORRIGÉ: Fonction fetchOrders avec filtrage cohérent
  const fetchOrders = useCallback(async (currentFilters = null, currentPage = null) => {  
  if (!isMountedRef.current) return;  
      
  try {  
    setLoading(true);  
    setError('');  
        
    const filtersToUse = currentFilters || filters;  
    const pageToUse = currentPage || pagination.page;  
      
    console.log('🔍 [DEBUG] Filtres appliqués:', filtersToUse);  
        
    // 🔧 CORRECTION: Mapper correctement les statuts  
    let statusFilter = undefined;  
    if (filtersToUse.status && filtersToUse.status !== 'all') {  
      const statusMapping = {  
        'EN_ATTENTE': 'pending',  
        'PLANIFIE': 'assigned',   
        'EN_COURS': 'in_progress',  
        'LIVRE': 'delivered',  
        'ANNULE': 'cancelled'  
      };  
      statusFilter = statusMapping[filtersToUse.status] || filtersToUse.status;  
    }  
      
    console.log('🎯 [DEBUG] Status mappé pour API:', statusFilter);  
      
    // 🔧 MODIFIÉ: Logique pour filtrer par date du jour  
    let dateFromFilter, dateToFilter;  
    if (filtersToUse.date) {  
      // Créer le début et la fin de la journée sélectionnée  
      const selectedDate = new Date(filtersToUse.date);  
      dateFromFilter = new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString();  
      dateToFilter = new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString();  
      console.log('📅 [DEBUG] Plage de dates:', { dateFromFilter, dateToFilter });  
    }  
        
    // Utiliser orderService.getOrders avec les filtres supportés par l'API  
    const response = await orderService.getOrders({  
      page: pageToUse,  
      limit: pagination.limit,  
      search: filtersToUse.search,  
      status: statusFilter,  
      dateFrom: dateFromFilter,  
      dateTo: dateToFilter  
    });  
  
    console.log('📊 [DEBUG] Réponse API:', response);  
  
    if (isMountedRef.current) {  
      // 🔧 CORRECTION: Appliquer les filtres non supportés par l'API côté client  
      let filteredData = response.data || [];  
        
      // Filtre par type de client  
      if (filtersToUse.clientType && filtersToUse.clientType !== 'all') {  
        filteredData = filteredData.filter((order) => {  
          const customerType = order.customer?.type ||   
                              (order.customer?.id ? 'PHYSIQUE' : 'MORAL');  
          return customerType.toLowerCase() === filtersToUse.clientType.toLowerCase();  
        });  
        console.log('🔍 [DEBUG] Après filtre clientType:', filteredData.length);  
      }  
        
      // 🔧 CORRECTION: Filtre par ville (remplace région)  
      if (filtersToUse.ville && filtersToUse.ville !== 'all') {  
        filteredData = filteredData.filter((order) => {  
          const city = order.deliveryAddress?.city || '';  
          return city.toLowerCase() === filtersToUse.ville.toLowerCase();  
        });  
        console.log('🔍 [DEBUG] Après filtre ville:', filteredData.length);  
      }  
        
      setOrders(filteredData);  
      setPagination(prev => ({  
        ...prev,  
        page: pageToUse,  
        total: filteredData.length,  
        totalPages: Math.ceil(filteredData.length / pagination.limit)  
      }));  
        
      console.log('✅ [DEBUG] Données finales:', filteredData.length, 'commandes');  
    }  
  } catch (err) {  
    console.error('💥 [ERROR] Erreur lors du chargement des commandes:', err);  
    if (isMountedRef.current) {  
      setError(err.message);  
    }  
  } finally {  
    if (isMountedRef.current) {  
      setLoading(false);  
    }  
  }  
}, [filters, pagination.page, pagination.limit]);

  // Effet pour charger les données
  useEffect(() => {
    loadCities(); // 🔧 NOUVEAU: Charger les villes
    fetchOrders(filters, pagination.page);
  }, [filters, pagination.page]);

  // Debounce pour la recherche
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
      
    if (filters.search.length >= 2 || filters.search === '') {
      searchTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        fetchOrders({ ...filters }, 1);
      }, 500);
    }
      
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters.search, fetchOrders]);

  // Gestionnaires d'événements
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    if (filterType !== 'search') {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchOrders(filters, pagination.page);
  }, [fetchOrders, filters, pagination.page]);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // 🔧 SUPPRIMÉ: Plus besoin de filtrage local car fait dans fetchOrders
  const filteredOrders = orders;

  // ✅ CORRIGÉ: Fonction pour obtenir l'état réel de la planification
  const getRealOrderState = (order) => {
    if (order.livraison?.etat) {
      return order.livraison.etat;
    }
    if (order.planification?.etat) {
      return order.planification.etat;
    }
    return 'EN_ATTENTE';
  };

  // Fonctions utilitaires pour l'affichage
  const getStateText = (state) => {
    const stateTexts = {
      'EN_ATTENTE': 'En attente',
      'PLANIFIE': 'Assignée',
      'EN_COURS': 'En cours',
      'LIVRE': 'Livrée',
      'ANNULE': 'Annulée',
      'ECHEC': 'Échec',
      'PARTIELLE': 'Partielle'
    };
    return stateTexts[state] || state;
  };

  const getStateBadgeClass = (state) => {
    const badgeClasses = {
      'EN_ATTENTE': 'tracking-badge-pending',
      'PLANIFIE': 'tracking-badge-assigned',
      'EN_COURS': 'tracking-badge-in-progress',
      'LIVRE': 'tracking-badge-delivered',
      'ANNULE': 'tracking-badge-cancelled',
      'ECHEC': 'tracking-badge-failed',
      'PARTIELLE': 'tracking-badge-partial'
    };
    return badgeClasses[state] || 'tracking-badge-default';
  };

  const getTotalAmount = (order) => {  
  // 🔧 PRIORITÉ 1: Montant calculé lors de la création de commande  
  if (order.montant_total) return order.montant_total;  
    
  // 🔧 PRIORITÉ 2: Calculer depuis les lignes de commande (products)  
  if (order.products && order.products.length > 0) {  
    const calculatedTotal = order.products.reduce((total, product) => {  
      const quantity = product.quantity || product.quantite || 0;  
      const price = product.price || product.prix_unitaire || 0;  
      return total + (quantity * price);  
    }, 0);  
      
    // Ajouter les frais de livraison si pas déjà inclus  
    return calculatedTotal > 0 ? calculatedTotal + 20 : calculatedTotal;  
  }  
    
  // 🔧 PRIORITÉ 3: Montant depuis planification/livraison (après assignation)  
  if (order.livraison?.total) return order.livraison.total;  
  if (order.planification?.total) return order.planification.total;  
    
  return 0;  
};

  const getTruckInfo = (order) => {
    console.log('🚛 [DEBUG] getTruckInfo - Order reçu:', order);
    console.log('🚛 [DEBUG] assignedTruck:', order.assignedTruck);
    console.log('🚛 [DEBUG] planification:', order.planification);
    console.log('🚛 [DEBUG] livraison:', order.livraison);
    
    // 1. Priorité: Camion assigné directement
    if (order.assignedTruck) {
      console.log('🚛 [DEBUG] Utilisation assignedTruck:', order.assignedTruck);
      return order.assignedTruck;
    }
    
    // 2. Priorité: Camion depuis la planification
    if (order.planification?.trucks_id) {
      console.log('🚛 [DEBUG] Utilisation planification.trucks_id:', order.planification.trucks_id);
      return {
        plateNumber: order.planification.trucks_id.matricule || 'N/A',
        model: order.planification.trucks_id.brand && order.planification.trucks_id.modele ? 
          `${order.planification.trucks_id.brand} ${order.planification.trucks_id.modele}` : 'N/A',
        capacity: order.planification.trucks_id.capacite || 'N/A'
      };
    }
    
    // 3. Priorité: Camion depuis la livraison
    if (order.livraison?.trucks_id) {
      console.log('🚛 [DEBUG] Utilisation livraison.trucks_id:', order.livraison.trucks_id);
      return {
        plateNumber: order.livraison.trucks_id.matricule || 'N/A',
        model: order.livraison.trucks_id.brand && order.livraison.trucks_id.modele ? 
          `${order.livraison.trucks_id.brand} ${order.livraison.trucks_id.modele}` : 'N/A',
        capacity: order.livraison.trucks_id.capacite || 'N/A'
      };
    }
    
    console.log('🚛 [DEBUG] Aucune information de camion trouvée');
    return null;
  };

  const getDriverInfo = (order) => {
    console.log('👤 [DEBUG] getDriverInfo - Order reçu:', order);
    
    // 1. Priorité: Chauffeur depuis la livraison
    if (order.livraison?.livreur_employee_id) {
      console.log('👤 [DEBUG] Utilisation livraison.livreur_employee_id:', order.livraison.livreur_employee_id);
      if (order.livraison.livreur_employee_id.physical_user_id) {
        const driver = order.livraison.livreur_employee_id.physical_user_id;
        return {
          name: `${driver.first_name} ${driver.last_name}`,
          matricule: order.livraison.livreur_employee_id.matricule || 'N/A',
          phone: driver.telephone_principal || 'N/A'
        };
      } else {
        return {
          name: 'Chauffeur assigné',
          matricule: order.livraison.livreur_employee_id.matricule || 'N/A',
          phone: 'N/A'
        };
      }
    }
    
    // 2. Priorité: Chauffeur depuis la planification
    if (order.planification?.livreur_employee_id) {
      console.log('👤 [DEBUG] Utilisation planification.livreur_employee_id:', order.planification.livreur_employee_id);
      if (order.planification.livreur_employee_id.physical_user_id) {
        const driver = order.planification.livreur_employee_id.physical_user_id;
        return {
          name: `${driver.first_name} ${driver.last_name}`,
          matricule: order.planification.livreur_employee_id.matricule || 'N/A',
          phone: driver.telephone_principal || 'N/A'
        };
      } else {
        return {
          name: 'Chauffeur assigné',
          matricule: order.planification.livreur_employee_id.matricule || 'N/A',
          phone: 'N/A'
        };
      }
    }
    
    // 3. Priorité: Chauffeur depuis le camion assigné
    if (order.assignedTruck?.driver) {
      console.log('👤 [DEBUG] Utilisation assignedTruck.driver:', order.assignedTruck.driver);
      return {
        name: order.assignedTruck.driver.name || 'Chauffeur du camion',
        matricule: order.assignedTruck.driver.matricule || 'N/A',
        phone: order.assignedTruck.driver.phone || 'N/A'
      };
    }
    
    console.log('👤 [DEBUG] Aucune information de chauffeur trouvée');
    return { name: 'Non assigné', matricule: 'N/A', phone: 'N/A' };
  };

  const getAccompagnantInfo = (order) => {
    console.log('👥 [DEBUG] getAccompagnantInfo - Order reçu:', order);
    
    // 1. Priorité: Accompagnant depuis la livraison
    if (order.livraison?.accompagnateur_id) {
      console.log('👥 [DEBUG] Utilisation livraison.accompagnateur_id:', order.livraison.accompagnateur_id);
      if (order.livraison.accompagnateur_id.physical_user_id) {
        const accompagnant = order.livraison.accompagnateur_id.physical_user_id;
        return {
          name: `${accompagnant.first_name} ${accompagnant.last_name}`,
          matricule: order.livraison.accompagnateur_id.matricule || 'N/A',
          phone: accompagnant.telephone_principal || 'N/A'
        };
      } else {
        return {
          name: 'Accompagnant assigné',
          matricule: order.livraison.accompagnateur_id.matricule || 'N/A',
          phone: 'N/A'
        };
      }
    }
    
    // 2. Priorité: Accompagnant depuis la planification
    if (order.planification?.accompagnateur_id) {
      console.log('👥 [DEBUG] Utilisation planification.accompagnateur_id:', order.planification.accompagnateur_id);
      if (order.planification.accompagnateur_id.physical_user_id) {
        const accompagnant = order.planification.accompagnateur_id.physical_user_id;
        return {
          name: `${accompagnant.first_name} ${accompagnant.last_name}`,
          matricule: order.planification.accompagnateur_id.matricule || 'N/A',
          phone: accompagnant.telephone_principal || 'N/A'
        };
      } else {
        return {
          name: 'Accompagnant assigné',
          matricule: order.planification.accompagnateur_id.matricule || 'N/A',
          phone: 'N/A'
        };
      }
    }
    
    // 3. Priorité: Accompagnant depuis le camion assigné
    if (order.assignedTruck?.accompagnateur) {
      console.log('👥 [DEBUG] Utilisation assignedTruck.accompagnateur:', order.assignedTruck.accompagnateur);
      return {
        name: order.assignedTruck.accompagnateur.name || 'Accompagnant du camion',
        matricule: order.assignedTruck.accompagnateur.matricule || 'N/A',
        phone: order.assignedTruck.accompagnateur.phone || 'N/A'
      };
    }
    
    console.log('👥 [DEBUG] Aucune information d\'accompagnant trouvée');
    return { name: 'Aucun', matricule: 'N/A', phone: 'N/A' };
  };

  const getDriverNotes = (order) => {
    if (order.livraison?.commentaires_livreur) {
      return order.livraison.commentaires_livreur;
    }
    if (order.livraison?.details) {
      return order.livraison.details;
    }
    return 'Aucune note';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const generateOrderHistory = (order) => {
    const history = [];
    
    if (order.orderDate) {
      history.push({
        id: 'hist-1',
        action: 'Commande créée',
        date: order.orderDate
      });
    }
    
    if (order.planification?.createdAt) {
      history.push({
        id: 'hist-2',
        action: 'Camion assigné',
        date: order.planification.createdAt
      });
    }
    
    if (order.livraison?.createdAt) {
      history.push({
        id: 'hist-3',
        action: 'Livraison démarrée',
        date: order.livraison.createdAt
      });
    }
    
    if (order.livraison?.updatedAt && order.livraison.etat === 'LIVRE') {
      history.push({
        id: 'hist-4',
        action: 'Livraison terminée',
        date: order.livraison.updatedAt
      });
    }
    
    return history.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // 🔧 CORRIGÉ: Fonction handleViewDetails avec mapping des données
  const handleViewDetails = async (order) => {
    console.log('🔍 [DEBUG] handleViewDetails - Début de la fonction');
    console.log('📦 [DEBUG] Order reçue:', order);
    
    try {
      setLoading(true);
      
      const orderId = order.id || order._id;
      console.log('🎯 [DEBUG] ID utilisé pour la requête:', orderId);
      
      if (!orderId) {
        console.error('❌ [ERROR] Aucun ID trouvé pour la commande');
        setError('Impossible de charger les détails: ID manquant');
        return;
      }
      
      console.log('🌐 [DEBUG] Appel à orderService.getOrder avec ID:', orderId);
      const detailedOrder = await orderService.getOrder(orderId);
      
      console.log('✅ [DEBUG] Réponse reçue:', detailedOrder);
      
      if (!detailedOrder) {
        console.error('❌ [ERROR] Réponse vide');
        setError('Aucune donnée reçue pour cette commande');
        return;
      }
      
      const orderData = detailedOrder.data || detailedOrder;
      
      // 🚛 NOUVEAU: Récupérer les données complètes du camion si disponible
      let truckDetails = null;
      if (order.planification?.trucks_id?._id || order.assignedTruckId) {
        const truckId = order.planification?.trucks_id?._id || order.assignedTruckId;
        console.log('🚛 [DEBUG] Récupération détails camion pour ID:', truckId);
        try {
          const truckResponse = await truckService.getTruckById(truckId);
          if (truckResponse && truckResponse.data) {
            truckDetails = truckResponse.data;
            console.log('🚛 [DEBUG] Détails camion récupérés:', truckDetails);
            
            // 👤 NOUVEAU: Récupérer les données complètes du chauffeur
            if (truckDetails.driver?.physical_user_id?._id) {
              try {
                const driverUserId = truckDetails.driver.physical_user_id._id;
                console.log('👤 [DEBUG] Récupération données complètes chauffeur pour ID:', driverUserId);
                const driverResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${driverUserId}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                  }
                });
                if (driverResponse.ok) {
                  const driverData = await driverResponse.json();
                  truckDetails.driver.physical_user_id = driverData.data || driverData;
                  console.log('👤 [DEBUG] Données complètes chauffeur récupérées:', truckDetails.driver.physical_user_id);
                }
              } catch (driverError) {
                console.warn('⚠️ [WARN] Impossible de récupérer les données complètes du chauffeur:', driverError);
              }
            }
            
            // 👥 NOUVEAU: Récupérer les données complètes de l'accompagnant
            if (truckDetails.accompagnant?.physical_user_id?._id) {
              try {
                const accompagnantUserId = truckDetails.accompagnant.physical_user_id._id;
                console.log('👥 [DEBUG] Récupération données complètes accompagnant pour ID:', accompagnantUserId);
                const accompagnantResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${accompagnantUserId}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                  }
                });
                if (accompagnantResponse.ok) {
                  const accompagnantData = await accompagnantResponse.json();
                  truckDetails.accompagnant.physical_user_id = accompagnantData.data || accompagnantData;
                  console.log('👥 [DEBUG] Données complètes accompagnant récupérées:', truckDetails.accompagnant.physical_user_id);
                }
              } catch (accompagnantError) {
                console.warn('⚠️ [WARN] Impossible de récupérer les données complètes de l\'accompagnant:', accompagnantError);
              }
            }
          }
        } catch (truckError) {
          console.warn('⚠️ [WARN] Impossible de récupérer les détails du camion:', truckError);
        }
      }
      
      // 🔧 CORRECTION: Mapper les données de la commande originale vers la structure attendue
      const enrichedOrder = {
        ...orderData,
        // Mapper les données de planification depuis la commande originale
        planification: order.planification ? {  
          ...order.planification,  
          trucks_id: order.planification.trucks_id || order.assignedTruck,  
          livreur_employee_id: order.planification.livreur_employee_id,  
          accompagnateur_id: order.planification.accompagnateur_id,  
          total: order.planification.total || order.livraison?.total || 0  
        } : null,  
          
        // Mapper les données de livraison depuis la commande originale    
        livraison: order.livraison ? {  
          ...order.livraison,  
          commentaires_livreur: order.livraison.commentaires_livreur || order.livraison.details,  
          total: order.livraison.total || order.livraison.total_ttc || 0  
        } : null,  
          
        // S'assurer que les champs essentiels existent  
        customer: orderData.customer || order.customer || { name: 'Client inconnu' },  
        deliveryAddress: orderData.deliveryAddress || order.deliveryAddress || {   
          city: 'Ville inconnue',   
          address: 'Adresse inconnue'   
        },  
        products: orderData.products || order.products || [],  
        orderNumber: orderData.orderNumber || order.orderNumber || order.numero_commande || 'N/A',  
        orderDate: orderData.orderDate || order.orderDate || order.createdAt,  
          
        // 🚛 NOUVEAU: Mapper assignedTruck avec les détails complets du camion
        // MAIS: Priorité aux données de planification pour les téléphones
        assignedTruck: truckDetails ? {
          id: truckDetails._id,
          plateNumber: truckDetails.matricule,
          model: truckDetails.brand && truckDetails.modele ? 
            `${truckDetails.brand} ${truckDetails.modele}` : 'N/A',
          capacity: truckDetails.capacite,
          driver: truckDetails.driver ? {
            name: `${truckDetails.driver.physical_user_id?.first_name || ''} ${truckDetails.driver.physical_user_id?.last_name || ''}`.trim(),
            matricule: truckDetails.driver.matricule,
            phone: truckDetails.driver.physical_user_id?.telephone_principal || 'N/A'
          } : null,
          accompagnateur: truckDetails.accompagnant ? {
            name: `${truckDetails.accompagnant.physical_user_id?.first_name || ''} ${truckDetails.accompagnant.physical_user_id?.last_name || ''}`.trim(),
            matricule: truckDetails.accompagnant.matricule,
            phone: truckDetails.accompagnant.physical_user_id?.telephone_principal || 'N/A'
          } : null
        } : (orderData.assignedTruck || order.assignedTruck),
        
        // 🚛 NOUVEAU: Forcer l'utilisation des données de planification pour les téléphones
        forceUsePlanification: true
      };
        
      console.log('🎨 [DEBUG] Données enrichies avec planification/livraison:', enrichedOrder);  
      console.log('🔍 [DEBUG] Planification mappée:', enrichedOrder.planification);  
      console.log('🔍 [DEBUG] Livraison mappée:', enrichedOrder.livraison);  
      console.log('🚛 [DEBUG] AssignedTruck enrichi:', enrichedOrder.assignedTruck);
        
      setSelectedOrder(enrichedOrder);  
      setIsDetailsModalOpen(true);  
      console.log('✅ [DEBUG] Modal ouverte avec données complètes');  
        
    } catch (error) {  
      console.error('💥 [ERROR] Erreur dans handleViewDetails:', error);  
      setError(`Erreur lors du chargement des détails: ${error.message}`);  
      alert(`Impossible de charger les détails de la commande.\nErreur: ${error.message}`);  
    } finally {  
      setLoading(false);  
      console.log('🏁 [DEBUG] handleViewDetails - Fin de la fonction');  
    }  
  };  
  
  const renderStars = (rating) => {  
    const stars = [];  
    const numRating = Number(rating) || 0;  
    for (let i = 1; i <= 5; i++) {  
      stars.push(  
        i <= numRating ?   
        <Star key={i} className="tracking-star-filled" /> :   
        <StarOff key={i} className="tracking-star-empty" />  
      );  
    }  
    return stars;  
  };  
  
  // Cleanup au démontage  
  useEffect(() => {  
    isMountedRef.current = true;  
    return () => {  
      isMountedRef.current = false;  
      if (searchTimeoutRef.current) {  
        clearTimeout(searchTimeoutRef.current);  
      }  
    };  
  }, []);  
  
  return (  
    <div className="tracking-management-layout">  
      <div className="tracking-management-wrapper">  
        <div className="tracking-management-container">  
          <div className="tracking-management-content">  
            {/* En-tête avec bouton refresh */}  
            <div className="tracking-page-header">  
              <div>  
                <h1 className="tracking-page-title">Suivi des Commandes</h1>  
                <p className="tracking-page-subtitle">Suivez l'état de toutes les commandes en temps réel</p>  
              </div>  
              <button  
                onClick={handleRefresh}  
                className="tracking-refresh-button"  
                disabled={loading}  
                title="Actualiser"  
              >  
                <RotateCcw className={`tracking-refresh-icon ${loading ? 'tracking-spinning' : ''}`} />  
                Actualiser  
              </button>  
            </div>  
  
            {/* Section des filtres avancés */}  
            <div className="tracking-filters-card">  
              <div className="tracking-filters-header">  
                <h3 className="tracking-filters-title">  
                  <Filter className="tracking-filter-icon" />  
                  Filtres et Recherche  
                </h3>  
              </div>  
              <div className="tracking-filters-content">  
                <div className="tracking-filters-grid">  
                  {/* Recherche */}  
                  <div className="tracking-form-group">  
                    <label className="tracking-label">Recherche</label>  
                    <div className="tracking-search-container">  
                      <Search className="tracking-search-icon" />  
                      <input  
                        type="text"  
                        placeholder="N° commande, client, ville..."  
                        value={filters.search}  
                        onChange={(e) => handleFilterChange('search', e.target.value)}  
                        className="tracking-search-input"  
                      />  
                    </div>  
                  </div>  
  
                  {/* Filtre par statut */}  
                  <div className="tracking-form-group">  
                    <label className="tracking-label">État</label>  
                    <select  
                      value={filters.status}  
                      onChange={(e) => handleFilterChange('status', e.target.value)}  
                      className="tracking-select"  
                    >  
                      <option value="all">Tous les états</option>  
                      <option value="EN_ATTENTE">En attente</option>  
                      <option value="PLANIFIE">Assignée</option>  
                      <option value="EN_COURS">En cours</option>  
                      <option value="LIVRE">Livrée</option>  
                      <option value="ANNULE">Annulée</option>  
                    </select>  
                  </div>  
  
                  {/* Filtre par type de client */}  
                  <div className="tracking-form-group">  
                    <label className="tracking-label">Type de client</label>  
                    <select  
                      value={filters.clientType}  
                      onChange={(e) => handleFilterChange('clientType', e.target.value)}  
                      className="tracking-select"  
                    >  
                      <option value="all">Tous les types</option>  
                      <option value="PHYSIQUE">Particulier</option>  
                      <option value="MORAL">Professionnel</option>  
                    </select>  
                  </div>  
  
                  {/* 🔧 MODIFIÉ: Filtre par ville (remplace région) */}  
                  <div className="tracking-form-group">  
                    <label className="tracking-label">Ville</label>  
                    <select  
                      value={filters.ville}  
                      onChange={(e) => handleFilterChange('ville', e.target.value)}  
                      className="tracking-select"  
                      disabled={loadingCities}  
                    >  
                      <option value="all">Toutes les villes</option>  
                      {cities.map(city => (  
                        <option key={city._id} value={city.name}>  
                          {city.name}  
                        </option>  
                      ))}  
                    </select>  
                  </div>  
  
                  {/* Filtre par date */}  
                  <div className="tracking-form-group">  
                    <label className="tracking-label">Date</label>  
                    <input  
                      type="date"  
                      value={filters.date}  
                      onChange={(e) => handleFilterChange('date', e.target.value)}  
                      className="tracking-input"  
                      title="Filtrer les commandes de cette date"  
                    />  
                  </div>

                </div>  
              </div>  
            </div>  
  
            {/* Affichage des erreurs */}  
            {error && (  
              <div className="tracking-error-alert">  
                <span>Erreur: {error}</span>  
                <button onClick={handleRefresh}>Réessayer</button>  
              </div>  
            )}  
  
            {/* Tableau des commandes */}  
            <div className="tracking-table-card">  
              <div className="tracking-table-header">  
                <h3 className="tracking-table-title">  
                  Liste des Commandes ({filteredOrders.length})  
                </h3>  
                {loading && <LoadingSpinner size="small" />}  
              </div>  
              <div className="tracking-table-content">  
                <div className="tracking-table-container">  
                  <table className="tracking-orders-table">  
                    <thead>  
                      <tr>  
                        <th>N° Cmd</th>  
                        <th>Client</th>  
                        <th>Ville</th>  
                        <th>Date</th>  
                        <th>Total (DH)</th>  
                        <th>État</th>  
                        <th>Camion</th>  
                        <th>Détails</th>  
                      </tr>  
                    </thead>  
                    <tbody>  
                      {filteredOrders.length === 0 ? (  
                        <tr>  
                          <td colSpan={8} className="tracking-no-results">  
                            {loading ? 'Chargement...' : 'Aucune commande trouvée pour vos critères.'}  
                          </td>  
                        </tr>  
                      ) : (  
                        filteredOrders.map((order) => {  
                          const realState = getRealOrderState(order);  
                          const totalAmount = getTotalAmount(order);  
                          const truckInfo = getTruckInfo(order);  
                              
                          return (  
                            <tr key={order.id}>  
                              <td className="tracking-font-medium">{order.orderNumber || order.numero_commande}</td>  
                              <td>{order.customer?.name || 'N/A'}</td>  
                              <td>{order.deliveryAddress?.city || 'N/A'}</td>  
                              <td>{formatDate(order.orderDate || order.date_commande)}</td>  
                              <td className="tracking-font-medium">  
                                {totalAmount ? `${totalAmount.toFixed(2)} DH` : 'N/A'}  
                              </td>  
                              <td>  
                                <span className={`tracking-badge ${getStateBadgeClass(realState)}`}>  
                                  {getStateText(realState)}  
                                </span>  
                              </td>  
                              <td>{truckInfo?.plateNumber || 'Non assigné'}</td>  
                              <td>  
                                <button   
                                  className="tracking-details-button"  
                                  onClick={() => handleViewDetails(order)}  
                                >  
                                  <Eye className="tracking-details-icon" />  
                                </button>  
                              </td>  
                            </tr>  
                          );  
                        })  
                      )}  
                    </tbody>  
                  </table>  
                </div>  
  
                {/* Pagination */}  
                {pagination.totalPages > 1 && (  
                  <Pagination  
                    currentPage={pagination.page}  
                    totalPages={pagination.totalPages}  
                    totalItems={pagination.total}  
                    itemsPerPage={pagination.limit}  
                    onPageChange={handlePageChange}  
                  />  
                )}  
              </div>  
            </div>  
          </div>  
        </div>  
      </div>  
  
      {/* Modal de détails de commande corrigée */}  
      {isDetailsModalOpen && selectedOrder && (  
        <div className="tracking-modal-overlay" onClick={() => setIsDetailsModalOpen(false)}>  
          <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>  
            <div className="tracking-modal-header">  
              <h2 className="tracking-modal-title">  
                Détails de la commande {selectedOrder.orderNumber || selectedOrder.numero_commande}  
              </h2>  
              <button className="tracking-modal-close" onClick={() => setIsDetailsModalOpen(false)}>  
                <X className="tracking-close-icon" />  
              </button>  
            </div>  
                  
            <div className="tracking-modal-body">  
              <div className="tracking-details-grid">  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Nom du client</label>  
                  <span className="tracking-detail-value">{selectedOrder.customer?.name || 'N/A'}</span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Type de client</label>  
                  <span className="tracking-client-badge tracking-client-badge-particulier">  
                    {selectedOrder.customer?.type_client === 'PHYSIQUE' ? 'Particulier' : 'Professionnel'}  
                  </span>  
                </div>  
  
                <div className="tracking-detail-item tracking-full-width">  
                  <label className="tracking-detail-label">Adresse complète</label>  
                  <span className="tracking-detail-value">  
                    {selectedOrder.deliveryAddress ?   
                      `${selectedOrder.deliveryAddress.address}, ${selectedOrder.deliveryAddress.city}` :   
                      'N/A'  
                    }  
                  </span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Ville</label>  
                  <span className="tracking-detail-value">{selectedOrder.deliveryAddress?.city || 'N/A'}</span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Produits</label>  
                  <div className="tracking-detail-value">  
                    {selectedOrder.products?.length > 0 ? (  
                      <ul className="tracking-products-list">  
                        {selectedOrder.products.map((product, index) => (  
                          <li key={index}>  
                            {product.product_id?.long_name || 'Produit'} -   
                            Qté: {product.quantity} {product.UM_id?.unitemesure || ''}  
                          </li>  
                        ))}  
                      </ul>  
                    ) : 'Aucun produit'}  
                  </div>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Total</label>  
                  <span className="tracking-detail-value tracking-total-highlight">  
                    {getTotalAmount(selectedOrder).toFixed(2)} DH  
                  </span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Date de commande</label>  
                  <span className="tracking-detail-value">  
                    {formatDate(selectedOrder.orderDate || selectedOrder.date_commande)}  
                  </span>  
                </div>  
  
                {/* Informations complètes du camion */}  
                {getTruckInfo(selectedOrder) && (  
                  <>  
                    <div className="tracking-detail-item">  
                      <label className="tracking-detail-label">Camion assigné</label>  
                      <span className="tracking-detail-value">  
                        {getTruckInfo(selectedOrder).plateNumber} - {getTruckInfo(selectedOrder).model}  
                      </span>  
                    </div>  
  
                    <div className="tracking-detail-item">  
                      <label className="tracking-detail-label">Capacité camion</label>  
                      <span className="tracking-detail-value">  
                        {getTruckInfo(selectedOrder).capacity} tonnes  
                      </span>  
                    </div>  
                  </>  
                )}  
  
                {/* Informations du chauffeur */}  
                {getDriverInfo(selectedOrder) && (  
                  <>  
                    <div className="tracking-detail-item">  
                      <label className="tracking-detail-label">Chauffeur</label>  
                      <span className="tracking-detail-value">  
                        {getDriverInfo(selectedOrder).name}  
                      </span>  
                    </div>  
  
                    <div className="tracking-detail-item">  
                      <label className="tracking-detail-label">Matricule chauffeur</label>  
                      <span className="tracking-detail-value">  
                        {getDriverInfo(selectedOrder).matricule}  
                      </span>  
                    </div>  
  
                    <div className="tracking-detail-item">  
                      <label className="tracking-detail-label">Téléphone chauffeur</label>  
                      <span className="tracking-detail-value">  
                        {getDriverInfo(selectedOrder).phone}  
                      </span>  
                    </div>  
                  </>  
                )}  
  
                {/* Informations de l'accompagnant */}  
                {getAccompagnantInfo(selectedOrder) && (  
                  <>  
                    <div className="tracking-detail-item">  
                      <label className="tracking-detail-label">Accompagnant</label>  
                      <span className="tracking-detail-value">  
                        {getAccompagnantInfo(selectedOrder).name}  
                      </span>  
                    </div>  
  
                    <div className="tracking-detail-item">  
                      <label className="tracking-detail-label">Matricule accompagnant</label>  
                      <span className="tracking-detail-value">  
                        {getAccompagnantInfo(selectedOrder).matricule}  
                      </span>  
                    </div>  
  
                    <div className="tracking-detail-item">  
                      <label className="tracking-detail-label">Téléphone accompagnant</label>  
                      <span className="tracking-detail-value">  
                        {getAccompagnantInfo(selectedOrder).phone}  
                      </span>  
                    </div>  
                  </>  
                )}  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">État de la commande</label>  
                  <span className={`tracking-badge ${getStateBadgeClass(getRealOrderState(selectedOrder))}`}>  
                    {getStateText(getRealOrderState(selectedOrder))}  
                  </span>  
                </div>  
  
                {/* Note du livreur */}  
                <div className="tracking-detail-item tracking-full-width">  
                  <label className="tracking-detail-label">Note du livreur</label>  
                  <span className="tracking-detail-value">  
                    {getDriverNotes(selectedOrder)}  
                  </span>  
                </div>  
  
                <div className="tracking-detail-item tracking-full-width">  
                  <label className="tracking-detail-label">Notes client</label>  
                  <span className="tracking-detail-value">  
                    {selectedOrder.customerNotes || selectedOrder.details || "Aucune note"}  
                  </span>  
                </div>  
  
                {/* Historique avec dates valides */}  
                <div className="tracking-detail-item tracking-full-width">  
                  <label className="tracking-detail-label">Historique</label>  
                  <div className="tracking-history-list">  
                    {generateOrderHistory(selectedOrder).map((event) => (  
                      <div key={event.id} className="tracking-history-item">  
                        <span className="tracking-history-date">  
                          {formatDate(event.date)}  
                        </span>  
                        <span className="tracking-history-action">{event.action}</span>  
                      </div>  
                    ))}  
                  </div>  
                </div>  
  
                {/* Évaluation si disponible */}  
                {selectedOrder.evaluation && (  
                  <div className="tracking-detail-item tracking-full-width">  
                    <label className="tracking-detail-label">Évaluation</label>  
                    <div className="tracking-rating">  
                      {renderStars(selectedOrder.evaluation)}  
                      <span className="tracking-rating-text">({selectedOrder.evaluation}/5)</span>  
                    </div>  
                  </div>  
                )}  
              </div>  
            </div>  
          </div>  
        </div>  
      )}  
    </div>  
  );  
}
