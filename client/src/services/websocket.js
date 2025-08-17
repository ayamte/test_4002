import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;

    this.alreadyIdentified = false;
    this.lastIdentifyPayload = null;
  }

  connect(serverUrl = 'http://localhost:5001') {
    try {
      this.socket = io(serverUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connecté');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.alreadyIdentified = false;

        // Réémettre identify si on a déjà identifié avant
        if (this.lastIdentifyPayload) {
          const { userId, deliveryId, type } = this.lastIdentifyPayload;
          this.identify(userId, deliveryId, type);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('❌ WebSocket déconnecté');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur connexion WebSocket:', error);
        this.reconnectAttempts++;
      });

      this.socket.on('position_updated', (data) => {
        this.notifyListeners('position_updated', data);
      });

      this.socket.on('status_updated', (data) => {
        this.notifyListeners('status_updated', data);
      });

    } catch (error) {
      console.error('Erreur initialisation WebSocket:', error);
    }
  }

  identify(userId, deliveryId, type = 'customer') {
    if (this.socket && this.isConnected && !this.alreadyIdentified) {
      const payload = { userId, deliveryId, type };
      this.socket.emit('identify', payload);
      this.alreadyIdentified = true;
      this.lastIdentifyPayload = payload;
      console.log(`✅ Identify émis pour ${type} - livraison ${deliveryId}`);
    } else if (this.alreadyIdentified) {
      console.log('ℹ️ Identify déjà effectué, on n’émet rien');
    }
  }

  updatePosition(deliveryId, latitude, longitude) {
    if (this.socket && this.isConnected) {
      this.socket.emit('position_update', {
        deliveryId,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });
    }
  }

  updateStatus(deliveryId, status, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('status_update', {
        deliveryId,
        status,
        message
      });
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Retourner une fonction de désinscription
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Erreur callback WebSocket:', error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.alreadyIdentified = false;
      this.lastIdentifyPayload = null;
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Instance singleton
const websocketService = new WebSocketService();

export default websocketService;
