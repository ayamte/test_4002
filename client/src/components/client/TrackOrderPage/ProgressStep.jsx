import React from "react";

const ProgressStep = ({ step, isCompleted, isCurrent, isLast }) => {
  const getIcon = (iconType) => {
    const iconProps = { size: 24 };
    switch(iconType) {
      case 'check':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
      case 'package':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 3h4v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V5h4l3-3zm0 3L9.5 7.5h5L12 5zm-4 8.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5S10.3 12 9.5 12s-1.5.7-1.5 1.5zm7 0c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5-.7-1.5-1.5-1.5-1.5.7-1.5 1.5z"/></svg>;
      case 'truck':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/></svg>;
      case 'mappin':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
      case 'warning':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>;
      case 'partial':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>;
      case 'clock':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/></svg>;
      default:
        return <div></div>;
    }
  };

  // Determine colors based on step status
  const getStepColors = () => {
    if (step.status === 'ECHEC') {
      return {
        bg: '#DC2626', // Red for failed
        text: 'text-red-900',
        time: 'text-red-600'
      };
    }
    if (step.status === 'PARTIELLE') {
      return {
        bg: '#F59E0B', // Orange for partial
        text: 'text-orange-900',
        time: 'text-orange-600'
      };
    }
    if (isCompleted) {
      return {
        bg: isCurrent ? '#4DAEBD' : '#1F55A3', // Blue gradient for completed
        text: 'text-gray-900',
        time: 'text-gray-600'
      };
    }
    return {
      bg: '#e5e7eb', // Gray for pending
      text: 'text-gray-400',
      time: 'text-gray-400'
    };
  };

  const colors = getStepColors();

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        {/* Step Icon */}
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white`}
          style={{ backgroundColor: colors.bg }}
        >
          {getIcon(step.iconType)}
        </div>
        
        {/* Step Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-bold ${colors.text}`}>
                {step.title}
              </h4>
              <p className={`text-sm ${colors.text}`}>
                {step.description}
              </p>
              {/* Additional status info for special cases */}
              {step.status === 'PARTIELLE' && (
                <p className="text-xs text-orange-600 mt-1">
                  Livraison partielle effectuée
                </p>
              )}
              {step.status === 'ECHEC' && step.failureReason && (
                <p className="text-xs text-red-600 mt-1">
                  {step.failureReason}
                </p>
              )}
            </div>
            <div className={`text-sm font-medium ${colors.time}`}>
              {step.time}
            </div>
          </div>
        </div>
      </div>
      
      {/* Connection Line */}
      {!isLast && (
        <div className={`absolute left-6 top-12 w-0.5 h-8 ${
          isCompleted ? 'bg-blue-300' : 'bg-gray-300'
        }`}></div>
      )}
    </div>
  );
};

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

// Utility function to generate dynamic status steps based on delivery data
export const generateStatusSteps = (deliveryData, orderData) => {
  // Safety check for null/undefined data
  if (!deliveryData && !orderData) {
    return getDefaultStatusSteps(0);
  }

  const now = new Date();
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

// Enhanced OrderProgress component
export const OrderProgress = ({ deliveryData, orderData, orderStatus = 0, statusSteps: legacyStatusSteps }) => {
  // Generate dynamic steps or fall back to legacy steps or default steps
  let statusSteps;
  
  try {
    statusSteps = generateStatusSteps(deliveryData, orderData);
  } catch (error) {
    console.warn('Error generating dynamic status steps:', error);
    statusSteps = legacyStatusSteps || getDefaultStatusSteps(orderStatus);
  }

  // Ensure statusSteps is always an array
  if (!Array.isArray(statusSteps) || statusSteps.length === 0) {
    statusSteps = getDefaultStatusSteps(orderStatus);
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        État de votre commande
      </h3>
      
      <div className="space-y-6">
        {statusSteps.map((step, index) => {
          const isCompleted = step.status === 'COMPLETED' || index <= (orderStatus || 0);
          const isCurrent = step.status === 'CURRENT' || index === (orderStatus || 0);
          const isLast = index === statusSteps.length - 1;
          
          return (
            <ProgressStep
              key={step.id || index}
              step={step}
              isCompleted={isCompleted || isCurrent}
              isCurrent={isCurrent}
              isLast={isLast}
            />
          );
        })}
      </div>
      
      {/* Additional info section */}
      {deliveryData?.commentaires_client && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            Commentaire client:
          </h4>
          <p className="text-blue-800 text-sm">
            {deliveryData.commentaires_client}
          </p>
        </div>
      )}
      
      {deliveryData?.commentaires_livreur && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">
            Note du livreur:
          </h4>
          <p className="text-gray-800 text-sm">
            {deliveryData.commentaires_livreur}
          </p>
        </div>
      )}
    </div>
  );
};

// Updated TrackOrder component integration - USE THIS IN YOUR TRACKORDER COMPONENT
export const useTrackOrderIntegration = (deliveryData, orderData) => {
  // Replace the old static statusSteps in your TrackOrder component with this:
  const statusSteps = generateStatusSteps(deliveryData, orderData);
  
  // Calculate current status for compatibility with existing code
  const getCurrentStatus = () => {
    if (!deliveryData) return 1; // Preparation phase
    
    switch (deliveryData.statut) {
      case 'EN_COURS': return 2; // En route
      case 'LIVREE': return 3; // Delivered
      case 'PARTIELLE': return 3; // Partial delivery
      case 'ECHEC': return 2; // Failed but was en route
      default: return 1;
    }
  };

  const getStatusDescription = () => {
    if (!deliveryData) {
      return "Votre commande est en cours de préparation";
    }
    
    switch(deliveryData.statut) {
      case 'EN_COURS': return "Votre commande est en route vers vous";
      case 'LIVREE': return "Votre commande a été livrée avec succès";
      case 'PARTIELLE': return "Votre commande a été partiellement livrée";
      case 'ECHEC': return "Problème lors de la livraison - Nouvelle tentative programmée";
      default: return "Suivi de votre commande";
    }
  };

  return {
    statusSteps,
    currentStatus: getCurrentStatus(),
    statusDescription: getStatusDescription()
  };
};

export default ProgressStep;