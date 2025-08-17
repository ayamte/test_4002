import { Package } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import StatisticsBar from '../../components/client/OrderHistoryPage/StatisticsBar';
import SearchAndFilters from '../../components/client/OrderHistoryPage/SearchAndFilters';
import OrderCard from '../../components/client/OrderHistoryPage/OrderCard';
import Title from '../../components/client/OrderHistoryPage/Title';
import './OrderHistory.css'; 

const OrderHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('toutes');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const customerId = "688bec637e0be4e53374e39e"; // Votre ID client

  // Fetch des données réelles depuis l'API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/commands/customer/${customerId}`);
        
        if (response.data.success) {
          setOrders(response.data.data.commandes);
        } else {
          setError('Erreur lors du chargement des commandes');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des commandes:', err);
        setError('Erreur de connexion au serveur');
        
        // En cas d'erreur, utiliser les données de test
        setOrders([
          {
            id: 1234,
            numero_commande: "GAZ-2024-001234",
            date: "2024-07-20",
            time: "14:30",
            statut_id: { nom: "Livrée" },
            items: [
              { name: "Bouteille Propane 34kg", quantity: 2, price: 200 },
              { name: "Bouteille Butane 12kg", quantity: 1, price: 50 }
            ],
            deliveryFee: 20,
            total: 270,
            driver: "Ahmed Benali",
            driverPhone: "+212 6 12 34 56 78"
          },
          {
            id: 1233,
            numero_commande: "GAZ-2024-001233",
            date: "2024-07-18",
            time: "10:15",
            statut_id: { nom: "Livrée" },
            items: [
              { name: "Bouteille Propane 34kg", quantity: 1, price: 100 },
              { name: "Bouteille Butane 12kg", quantity: 2, price: 100 }
            ],
            deliveryFee: 15,
            total: 215,
            driver: "Youssef Alami",
            driverPhone: "+212 6 98 76 54 32"
          },
          {
            id: 1232,
            numero_commande: "GAZ-2024-001232",
            date: "2024-07-22",
            time: "16:45",
            statut_id: { nom: "En cours" },
            items: [
              { name: "Bouteille Propane 34kg", quantity: 3, price: 300 }
            ],
            deliveryFee: 25,
            total: 325,
            driver: "Mohammed Kadiri",
            driverPhone: "+212 6 11 22 33 44"
          },
          {
            id: 1231,
            numero_commande: "GAZ-2024-001231",
            date: "2024-07-15",
            time: "09:20",
            statut_id: { nom: "Annulée" },
            items: [
              { name: "Bouteille Butane 12kg", quantity: 4, price: 200 }
            ],
            deliveryFee: 20,
            total: 220,
            driver: null,
            driverPhone: null
          }
        ]);
        
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerId]);

  // Filtrer les commandes
  const filteredOrders = useMemo(() => {
    /*console.log("🔍 searchTerm:", searchTerm);
    console.log("🧪 filterStatus:", filterStatus);
    console.log("📦 orders:", orders);*/

    if (!Array.isArray(orders) || orders.length === 0) return [];
    
    return orders.filter(order => {
      const matchesSearch = order.numero_commande?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterStatus === 'toutes' || order.statut_id?.nom === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus, orders]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) {
      return { livrees: 0, enCours: 0, annulees: 0, totalPrix: 0, total: 0 };
    }
    
    const livrees = orders.filter(o => o.statut_id?.nom === 'Livrée').length;
    const enCours = orders.filter(o => o.statut_id?.nom === 'En cours').length;
    const annulees = orders.filter(o => o.statut_id?.nom === 'Annulée').length;
    const confirmées = orders.filter(o => o.statut_id?.nom === 'Confirmée').length;
    const planifiées = orders.filter(o => o.statut_id?.nom === 'Planifiée').length;
    const nouvelles = orders.filter(o => o.statut_id?.nom === 'Nouvelle').length;
    const totalPrix = orders.filter(o => o.statut_id?.nom === 'Livrée').reduce((sum, o) => sum + (o.total || 0), 0);
    
    return { livrees, enCours, annulees, confirmées, planifiées, nouvelles, totalPrix, total: orders.length };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-lg">Chargement des commandes...</div>
      </div>
    );
  }

  return (
  <div className="order-wrapper">  
<div className="order-container">  
  <div className="order-content">  
    <div className="order-page-content">  
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Title stats={stats} customerId={customerId}/>

      <div className="max-w-6xl mx-auto p-6">
        {/* Statistiques */}
        <StatisticsBar customerId={customerId}/>

        {/* Barre de recherche et filtres */}
        <SearchAndFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        {/* Message d'erreur si API échoue */}
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>{error} - Affichage des données de test</p>
          </div>
        )}

        {/* Liste des commandes */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {orders.length === 0 ? 'Aucune commande trouvée' : 'Aucune commande ne correspond aux critères de recherche'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>

        {/* Résumé en bas */}
        {filteredOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mt-6">
            <div className="text-center text-gray-600">
              <p>Affichage de {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} sur {orders.length} au total</p>
            </div>
          </div>
        )}
      </div>
    </div>
           </div>  
      </div>  
    </div>  
  </div> 
  );
};

export default OrderHistory;