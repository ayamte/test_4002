import React from "react";
import ProgressStep from '../TrackOrderPage/ProgressStep';

// Default fallback status steps
const getDefaultStatusSteps = (orderStatus = 0) => {
  return [
    { 
      id: 0, 
      title: "Commande confirmée", 
      iconType: "check", 
      time: "14:30",
      description: "Votre commande a été confirmée",
      status: 'COMPLETED'
    },
    { 
      id: 1, 
      title: "Préparation terminée", 
      iconType: "package", 
      time: "15:15",
      description: "Votre commande est prête",
      status: orderStatus >= 1 ? 'COMPLETED' : 'PENDING'
    },
    { 
      id: 2, 
      title: "En route", 
      iconType: "truck", 
      time: "15:45",
      description: "Le livreur est en route vers vous",
      status: orderStatus >= 2 ? 'CURRENT' : 'PENDING'
    },
    { 
      id: 3, 
      title: "Livraison", 
      iconType: "mappin", 
      time: "16:30 (estimé)",
      description: "Livraison en cours",
      status: orderStatus >= 3 ? 'COMPLETED' : 'PENDING'
    }
  ];
};

// Generate dynamic status steps based on delivery data
const generateStatusSteps = (deliveryData, orderData) => {
  // Safety check for null/undefined data
  if (!deliveryData && !orderData) {
    return getDefaultStatusSteps(0);
  }

  const formatTime = (date) => {
    if (!date) return "En attente";
    try {
      return new Date(date).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return "En attente";
    }
  };

  // Base steps that always exist
  const baseSteps = [
    {
      id: 0,
      title: "Commande confirmée",
      iconType: "check",
      time: formatTime(orderData?.command?.date_commande),
      description: "Votre commande a été confirmée",
      status: 'COMPLETED'
    },
    {
      id: 1,
      title: "Préparation terminée",
      iconType: "package",
      time: formatTime(deliveryData?.planification_id?.date_livraison_prevue),
      description: "Votre commande est prête pour la livraison",
      status: deliveryData ? 'COMPLETED' : 'PENDING'
    }
  ];

  // Dynamic steps based on delivery status
  const deliverySteps = [];
  
  if (!deliveryData) {
    // No delivery data - show planning step
    deliverySteps.push({
      id: 2,
      title: "En attente de planification",
      iconType: "clock",
      time: "En cours",
      description: "Planification de la livraison en cours",
      status: 'PENDING'
    });
  } else {
    // Delivery exists - add appropriate steps
    switch (deliveryData.statut) {
      case 'EN_COURS':
        deliverySteps.push(
          {
            id: 2,
            title: "En route",
            iconType: "truck",
            time: formatTime(deliveryData.createdAt),
            description: "Le livreur est en route vers vous",
            status: 'CURRENT'
          },
          {
            id: 3,
            title: "Livraison",
            iconType: "mappin",
            time: "Estimation en cours",
            description: "Livraison en cours",
            status: 'PENDING'
          }
        );
        break;

      case 'LIVREE':
        deliverySteps.push(
          {
            id: 2,
            title: "En route",
            iconType: "truck",
            time: formatTime(deliveryData.createdAt),
            description: "Le livreur était en route",
            status: 'COMPLETED'
          },
          {
            id: 3,
            title: "Livraison réussie",
            iconType: "check",
            time: formatTime(deliveryData.date_livraison),
            description: "Votre commande a été livrée avec succès",
            status: 'COMPLETED'
          }
        );
        
        // Add evaluation step if available
        if (deliveryData.evaluation_client) {
          deliverySteps.push({
            id: 4,
            title: "Évaluation",
            iconType: "check",
            time: formatTime(deliveryData.updatedAt),
            description: `Évaluation: ${deliveryData.evaluation_client}/5 étoiles`,
            status: 'COMPLETED'
          });
        }
        break;

      case 'PARTIELLE':
        deliverySteps.push(
          {
            id: 2,
            title: "En route",
            iconType: "truck",
            time: formatTime(deliveryData.createdAt),
            description: "Le livreur était en route",
            status: 'COMPLETED'
          },
          {
            id: 3,
            title: "Livraison partielle",
            iconType: "partial",
            time: formatTime(deliveryData.date_livraison),
            description: "Livraison partiellement effectuée",
            status: 'PARTIELLE'
          },
          {
            id: 4,
            title: "Complément prévu",
            iconType: "clock",
            time: "À programmer",
            description: "Livraison du complément en cours de planification",
            status: 'PENDING'
          }
        );
        break;

      case 'ECHEC':
        deliverySteps.push(
          {
            id: 2,
            title: "En route",
            iconType: "truck",
            time: formatTime(deliveryData.createdAt),
            description: "Le livreur était en route",
            status: 'COMPLETED'
          },
          {
            id: 3,
            title: "Échec de livraison",
            iconType: "warning",
            time: formatTime(deliveryData.date_livraison),
            description: "Problème lors de la livraison",
            status: 'ECHEC',
            failureReason: deliveryData.commentaires_livreur || "Raison non spécifiée"
          },
          {
            id: 4,
            title: "Nouvelle tentative",
            iconType: "clock",
            time: "À programmer",
            description: "Reprogrammation de la livraison",
            status: 'PENDING'
          }
        );
        break;

      default:
        // Default case - basic delivery steps
        deliverySteps.push({
          id: 2,
          title: "Livraison prévue",
          iconType: "truck",
          time: formatTime(deliveryData.date_livraison),
          description: "Livraison planifiée",
          status: 'PENDING'
        });
    }
  }

  return [...baseSteps, ...deliverySteps];
};

const OrderProgress = ({ 
  orderStatus, 
  statusSteps, 
  deliveryData, 
  orderData,
  // New props for enhanced functionality
  showComments = false,
  showEvaluation = false 
}) => {
  // Determine which steps to use
  let finalStatusSteps;
  
  try {
    if (deliveryData || orderData) {
      // Use dynamic generation if we have delivery/order data
      finalStatusSteps = generateStatusSteps(deliveryData, orderData);
    } else if (statusSteps && Array.isArray(statusSteps)) {
      // Fall back to provided statusSteps
      finalStatusSteps = statusSteps;
    } else {
      // Final fallback to default steps
      finalStatusSteps = getDefaultStatusSteps(orderStatus || 0);
    }
  } catch (error) {
    console.warn('Error generating status steps:', error);
    finalStatusSteps = statusSteps || getDefaultStatusSteps(orderStatus || 0);
  }

  // Ensure we always have valid steps
  if (!Array.isArray(finalStatusSteps) || finalStatusSteps.length === 0) {
    finalStatusSteps = getDefaultStatusSteps(orderStatus || 0);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-6" style={{color: '#245FA6'}}>
        Progression de votre commande
      </h3>
      
      <div className="space-y-4">
        {finalStatusSteps.map((step, index) => {
          // Enhanced logic for determining step state
          let isCompleted, isCurrent;
          
          if (step.status) {
            // Use the status property if available
            isCompleted = step.status === 'COMPLETED';
            isCurrent = step.status === 'CURRENT';
          } else {
            // Fall back to original logic
            isCompleted = orderStatus >= step.id;
            isCurrent = orderStatus === step.id;
          }

          return (
            <ProgressStep
              key={step.id || index}
              step={step}
              isCompleted={isCompleted || isCurrent}
              isCurrent={isCurrent}
              isLast={index === finalStatusSteps.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgress;