// chronogaz_back/middleware/websocket.js
const connectedClients = new Map();
const deliverySubscriptions = new Map();

const setupWebSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔗 Client connecté: ${socket.id}`);
    
    // Stockage du client
    connectedClients.set(socket.id, {
      socket: socket,
      userId: null,
      deliveryId: null,
      connectedAt: new Date()
    });

    // Événement d'authentification/identification
    socket.on('identify', (data) => {
      const { userId, deliveryId, type } = data;
      const client = connectedClients.get(socket.id);
      
      if (client) {
        client.userId = userId;
        client.deliveryId = deliveryId;
        client.type = type; // 'customer' ou 'driver'
        
        // S'abonner aux mises à jour de cette livraison
        if (deliveryId) {
          if (!deliverySubscriptions.has(deliveryId)) {
            deliverySubscriptions.set(deliveryId, new Set());
          }
          deliverySubscriptions.get(deliveryId).add(socket.id);
          
          socket.join(`delivery_${deliveryId}`);
          console.log(`👤 Client ${socket.id} abonné à la livraison ${deliveryId}`);
        }
      }
    });

    // Événement de mise à jour de position (du livreur)
    socket.on('position_update', (data) => {
      const { deliveryId, latitude, longitude, timestamp } = data;
      
      // Diffuser la mise à jour à tous les clients abonnés à cette livraison
      socket.to(`delivery_${deliveryId}`).emit('position_updated', {
        deliveryId,
        position: { latitude, longitude },
        timestamp: timestamp || new Date().toISOString()
      });
      
      console.log(`📍 Position mise à jour pour livraison ${deliveryId}: ${latitude}, ${longitude}`);
    });

    // Événement de changement de statut de livraison
    socket.on('status_update', (data) => {
      const { deliveryId, status, message } = data;
      
      socket.to(`delivery_${deliveryId}`).emit('status_updated', {
        deliveryId,
        status,
        message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🔄 Statut mis à jour pour livraison ${deliveryId}: ${status}`);
    });

    // Déconnexion
    socket.on('disconnect', () => {
      const client = connectedClients.get(socket.id);
      
      if (client && client.deliveryId) {
        const subscribers = deliverySubscriptions.get(client.deliveryId);
        if (subscribers) {
          subscribers.delete(socket.id);
          if (subscribers.size === 0) {
            deliverySubscriptions.delete(client.deliveryId);
          }
        }
      }
      
      connectedClients.delete(socket.id);
      console.log(`❌ Client déconnecté: ${socket.id}`);
    });
  });

  // Fonction utilitaire pour diffuser des mises à jour depuis les contrôleurs
  const broadcastToDelivery = (deliveryId, event, data) => {
    io.to(`delivery_${deliveryId}`).emit(event, data);
  };

  // Exposer les fonctions utilitaires
  io.broadcastToDelivery = broadcastToDelivery;
  io.getConnectedClients = () => connectedClients;
  io.getDeliverySubscriptions = () => deliverySubscriptions;
};

module.exports = setupWebSocket;