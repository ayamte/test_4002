import React from "react";
import { useState, useEffect } from "react";
import axios from 'axios';
import Title from "../../components/client/TrackOrderPage/Title";
import OrderStatusCard from "../../components/client/TrackOrderPage/OrderStatusCard";
import OrderProgress from "../../components/client/TrackOrderPage/OrderProgress";
import DeliveryDriverInfo from "../../components/client/TrackOrderPage/DeliveryDriverInfo";
import InteractiveMap from "../../components/client/TrackOrderPage/InteractiveMap";
import OrderSummary from "../../components/client/TrackOrderPage/OrderSummary";
import CancelOrderButton from '../../components/client/TrackOrderPage/CancelOrderButton'; 
import './TrackOrder.css'; 

import { useParams } from 'react-router-dom';

const TrackOrder = () => {
  const [orderStatus, setOrderStatus] = useState(2);
  const [deliveryPosition, setDeliveryPosition] = useState({
    lat: 33.5731,
    lng: -7.5898
  });
  const [destinationPosition, setDestinationPosition] = useState({
    lat: 33.5831,
    lng: -7.5798
  });
  const [manualAddress, setManualAddress] = useState("");
  
  // États pour les données de livraison
  const [deliveryData, setDeliveryData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer l'ID depuis les paramètres de l'URL ou utiliser l'ID de test
  const { deliveryId } = useParams();
  const currentDeliveryId = deliveryId || "688f7ea951209c4edf0a4cbc"; // id test

  // Fetch des données de livraison et commande
  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Récupérer les données de la livraison
        const deliveryResponse = await axios.get(`http://localhost:5001/api/deliveries/${currentDeliveryId}`);
        
        if (deliveryResponse.data.success) {
          const delivery = deliveryResponse.data.data;
          setDeliveryData(delivery);

          // 2. Si on a une planification, récupérer les détails de la commande
          if (delivery.planification_id && delivery.planification_id.commande_id) {
            const commandId = delivery.planification_id.commande_id._id || delivery.planification_id.commande_id;
            
            try {
              const commandResponse = await axios.get(`http://localhost:5001/api/commands/${commandId}`);
              
              if (commandResponse.data.success) {
                setOrderData(commandResponse.data.data);
              }
            } catch (commandError) {
              console.warn('Erreur lors de la récupération des détails de commande:', commandError);
              // Utiliser les données de base de la livraison
              setOrderData({
                command: delivery.planification_id.commande_id,
                lignes: [],
                planification: delivery.planification_id
              });
            }
          }

          // 3. Mettre à jour la position de destination si disponible
          const addressLivraison = delivery.planification_id?.commande_id?.address_livraison_id;
          if (addressLivraison && addressLivraison.latitude && addressLivraison.longitude) {
            setDestinationPosition({
              lat: parseFloat(addressLivraison.latitude),
              lng: parseFloat(addressLivraison.longitude)
            });
          }

          // 4. Mettre à jour la position du livreur si disponible
          if (delivery.latitude_livraison && delivery.longitude_livraison) {
            setDeliveryPosition({
              lat: parseFloat(delivery.latitude_livraison),
              lng: parseFloat(delivery.longitude_livraison)
            });
          }

        } else {
          setError('Livraison non trouvée');
        }

      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Erreur de connexion au serveur');
        
        // Données de fallback pour le développement
        setOrderData({
          command: {
            numero_commande: "GAZ-2024-001234",
            date_commande: new Date(),
            customer_id: { customer_code: "CLIENT001", type_client: "PARTICULIER" },
            statut_id: { code: "EN_COURS", nom: "En cours" },
            total_ttc: 270
          },
          lignes: [
            {
              product_id: { nom_long: "Bouteille Propane 34kg", reference: "PROP34" },
              quantite: 2,
              prix_unitaire: 100,
              total_ligne: 200,
              um_id: { nom: "Unité" }
            }
          ],
          planification: null
        });
        
      } finally {
        setLoading(false);
      }
    };

    if (currentDeliveryId) {
      fetchDeliveryData();
    }
  }, [currentDeliveryId]);

  const handlePositionUpdate = (position) => {
    console.log('Position mise à jour:', position);
    setDeliveryPosition({
      lat: position.latitude,
      lng: position.longitude
    });
  };

  const handleStatusChange = (status) => {
    console.log('Statut changé:', status);
    // Mettre à jour le statut local si nécessaire
    setOrderStatus(status);
  };
  
  // Position de destination depuis localStorage (fallback)
  useEffect(() => {
    const savedOrder = JSON.parse(localStorage.getItem('lastOrder'));
    if (savedOrder && !destinationPosition.lat){
      if (savedOrder.useGPS && savedOrder.gpsLocation){
        setDestinationPosition({
          lat: savedOrder.gpsLocation.latitude,
          lng: savedOrder.gpsLocation.longitude
        });
      } else if (!savedOrder.useGPS) {
        setManualAddress(savedOrder.address.fullAddress);
      }
    }
  }, [destinationPosition.lat]);
  
  // Simuler le mouvement du livreur vers la destination
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryPosition(prev => {
        const latDiff = destinationPosition.lat - prev.lat;
        const lngDiff = destinationPosition.lng - prev.lng;
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        
        if (distance > 0.001) {
          return {
            lat: prev.lat + (latDiff * 0.05) + (Math.random() - 0.5) * 0.0005,
            lng: prev.lng + (lngDiff * 0.05) + (Math.random() - 0.5) * 0.0005
          };
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [destinationPosition]);

  // Données basées sur les données réelles ou fallback
  const orderNumber = orderData?.command?.numero_commande || "GAZ-2024-001234";
  
  const statusSteps = [
    { 
      id: 0, 
      title: "Commande confirmée", 
      iconType: "check", 
      time: "14:30",
      description: "Votre commande a été confirmée"
    },
    { 
      id: 1, 
      title: "Préparation terminée", 
      iconType: "package", 
      time: "15:15",
      description: "Votre commande est prête"
    },
    { 
      id: 2, 
      title: "En route", 
      iconType: "truck", 
      time: "15:45",
      description: "Le livreur est en route vers vous"
    },
    { 
      id: 3, 
      title: "Livraison", 
      iconType: "mappin", 
      time: "16:30 (estimé)",
      description: "Livraison en cours"
    }
  ];

  // Informations du livreur depuis les données réelles
  const deliveryDriver = deliveryData?.planification_id?.livreur_id ? {
    name: `${deliveryData.planification_id.livreur_id.physical_user_id?.first_name || ''} ${deliveryData.planification_id.livreur_id.physical_user_id?.last_name || ''}`.trim(),
    phone: deliveryData.planification_id.livreur_id.physical_user_id?.telephone_principal || "+212 6 12 34 56 78",
    vehicle: deliveryData.planification_id.truck_id ? 
      `${deliveryData.planification_id.truck_id.marque} - ${deliveryData.planification_id.truck_id.matricule}` : 
      "Camionnette - ABC 1234"
  } : {
    name: "Ahmed Benali",
    phone: "+212 6 12 34 56 78",
    vehicle: "Camionnette - ABC 1234"
  };

  const getStatusDescription = () => {
    if (deliveryData) {
      switch(deliveryData.statut) {
        case 'EN_COURS': return "Votre commande est en route vers vous";
        case 'LIVREE': return "Votre commande a été livrée avec succès";
        case 'ECHEC': return "Problème lors de la livraison";
        default: return "Suivi de votre commande";
      }
    }
    
    switch(orderStatus) {
      case 0: return "Votre commande a été confirmée avec succès";
      case 1: return "Votre commande est en cours de préparation";
      case 2: return "Votre commande est en route vers vous";
      case 3: return "Le livreur est arrivé à destination";
      default: return "Suivi de votre commande";
    }
  };

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg">Chargement des informations de livraison...</div>
        </div>
      </div>
    );
  }

  return (
          <div className="track-wrapper">  
        <div className="track-container">  
          <div className="track-content">  
            <div className="track-page-content"> 
    <div className="min-h-screen bg-gray-50">
      <Title title="Suivre ma Commande" />

      <div className="max-w-4xl mx-auto p-6">
        {/* Message d'erreur si API échoue */}
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>{error} - Affichage des données de test</p>
          </div>
        )}

        <OrderStatusCard 
          orderNumber={orderNumber}
          statusDescription={getStatusDescription()}
          estimatedTime="16:30"
        />

<OrderProgress 
  orderStatus={orderStatus}
  deliveryData={deliveryData}
  orderData={orderData}
/>

        <DeliveryDriverInfo 
          driver={deliveryDriver}
          isVisible={orderStatus >= 2}
        />

        <InteractiveMap
          deliveryId={currentDeliveryId}
          isVisible={true}
          autoCenter={true}
          showRoute={true}
          updateInterval={10000}
          onPositionUpdate={handlePositionUpdate}
          onStatusChange={handleStatusChange}
        />   

        {/* Passer les données en props au lieu de l'ID */}
        <OrderSummary orderData={orderData} loading={loading} error={error} />

        <CancelOrderButton
          orderId={orderData?.command?._id}
          currentStatus={orderData?.command?.statut_id?.code}
          onCancelSuccess={() => {
            setOrderData((prev) => ({
              ...prev,
              command: {
                ...prev.command,
                statut_id: {
                  ...prev.command.statut_id,
                  code: "ANNULEE",
                  nom: "Annulée"
                }
              }
            }));
          }}
        />

      </div>
    </div>
           </div>  
      </div>  
    </div>  
  </div> 
  );
};

export default TrackOrder;