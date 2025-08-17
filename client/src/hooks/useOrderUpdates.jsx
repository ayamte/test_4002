import { useState, useEffect } from 'react';  
import { useWebSocket } from './useWebSocket';  
  
export const useOrderUpdates = () => {  
  const { subscribe, isConnected } = useWebSocket(true);  
  const [newOrdersCount, setNewOrdersCount] = useState(0);  
  const [statusUpdates, setStatusUpdates] = useState([]);  
    
  useEffect(() => {  
    if (isConnected) {  
      const unsubscribeNewOrder = subscribe('new_order', (data) => {  
        console.log('Nouvelle commande reçue:', data);  
        setNewOrdersCount(prev => prev + 1);  
        // Déclencher un refresh des données  
        window.dispatchEvent(new CustomEvent('refreshOrders'));  
      });  
        
      const unsubscribeStatusChange = subscribe('order_status_updated', (data) => {  
        console.log('Statut mis à jour:', data);  
        setStatusUpdates(prev => [...prev, data]);  
        // Déclencher un refresh des données  
        window.dispatchEvent(new CustomEvent('refreshOrders'));  
      });  
        
      return () => {  
        unsubscribeNewOrder();  
        unsubscribeStatusChange();  
      };  
    }  
  }, [isConnected, subscribe]);  
  
  return {  
    newOrdersCount,  
    statusUpdates,  
    isConnected  
  };  
};