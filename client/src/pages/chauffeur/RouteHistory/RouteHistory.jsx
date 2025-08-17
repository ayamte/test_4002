import React, { useState, useEffect } from 'react'  
import {  
  MdLocalShipping as TruckIcon,  
  MdCheckCircle as CheckCircle,  
  MdCancel as XCircle,  
  MdWarning as AlertTriangle,  
  MdInventory as Package,  
  MdDescription as FileText,  
  MdDownload as Download,  
  MdAccessTime as Clock,  
  MdLocationOn as MapPin,  
  MdCalendarToday as Calendar,  
} from 'react-icons/md'  
import './RouteHistory.css'  
  
// Mock data pour l'historique des tournées  
const mockRouteHistories = [  
  {  
    routeId: "route-2024-001",  
    chauffeurId: "chauffeur-001",  
    truckId: "truck-001",  
    routeDate: "2024-01-15",  
    startTime: "08:00",  
    endTime: "17:30",  
    totalDeliveries: 4,  
    successfulDeliveries: 3,  
    failedDeliveries: 0,  
    partialDeliveries: 1,  
    totalDistance: 85.5,  
    fuelUsed: 12.3,  
    status: "finalized",  
    deliveries: [  
      {  
        id: "del-001",  
        orderNumber: "CMD-2024-001",  
        customerName: "Restaurant Le Gourmet",  
        address: "15 Rue de la Paix, 75001 Paris",  
        timeWindow: "08:00 - 10:00",  
        actualDeliveryTime: "09:15",  
        status: "delivered",  
        products: [  
          {  
            id: "prod-001",  
            productName: "Bouteille Gaz Butane 13kg",  
            productCode: "BUT13",  
            quantityPlanned: 10,  
            quantityDelivered: 10,  
            unit: "bottles",  
          },  
        ],  
        customerNotes: "Livraison parfaite, client satisfait",  
      },  
      {  
        id: "del-002",  
        orderNumber: "CMD-2024-002",  
        customerName: "Boulangerie Martin",  
        address: "42 Avenue des Champs, 75008 Paris",  
        timeWindow: "10:30 - 12:00",  
        actualDeliveryTime: "11:45",  
        status: "delivered",  
        products: [  
          {  
            id: "prod-002",  
            productName: "Bouteille Gaz Propane 35kg",  
            productCode: "PRO35",  
            quantityPlanned: 5,  
            quantityDelivered: 5,  
            unit: "bottles",  
          },  
        ],  
        customerNotes: "Accès par la cour arrière comme convenu",  
      },  
      {  
        id: "del-003",  
        orderNumber: "CMD-2024-003",  
        customerName: "Hôtel Royal",  
        address: "8 Place Vendôme, 75001 Paris",  
        timeWindow: "14:00 - 16:00",  
        actualDeliveryTime: "15:20",  
        status: "delivered",  
        products: [  
          {  
            id: "prod-003",  
            productName: "Bouteille Gaz Butane 6kg",  
            productCode: "BUT06",  
            quantityPlanned: 15,  
            quantityDelivered: 15,  
            unit: "bottles",  
          },  
        ],  
        customerNotes: "Réception au sous-sol, signature du responsable",  
      },  
      {  
        id: "del-004",  
        orderNumber: "CMD-2024-004",  
        customerName: "Café Central",  
        address: "25 Boulevard Saint-Germain, 75005 Paris",  
        timeWindow: "16:30 - 18:00",  
        actualDeliveryTime: "17:15",  
        status: "partial",  
        products: [  
          {  
            id: "prod-004",  
            productName: "Bouteille Gaz Butane 13kg",  
            productCode: "BUT13",  
            quantityPlanned: 8,  
            quantityDelivered: 6,  
            unit: "bottles",  
            discrepancy: -2,  
            notes: "Client a refusé 2 bouteilles - dates trop anciennes",  
          },  
        ],  
        issues: [  
          {  
            id: "issue-001",  
            type: "product_issue",  
            description: "Client a refusé 2 bouteilles en raison de dates de péremption proches",  
            timestamp: "17:15",  
          },  
        ],  
        customerNotes: "Prévoir remplacement des 2 bouteilles refusées",  
      },  
    ],  
  },  
  {  
    routeId: "route-2024-002",  
    chauffeurId: "chauffeur-001",  
    truckId: "truck-001",  
    routeDate: "2024-01-14",  
    startTime: "08:30",  
    endTime: "16:45",  
    totalDeliveries: 3,  
    successfulDeliveries: 3,  
    failedDeliveries: 0,  
    partialDeliveries: 0,  
    totalDistance: 67.2,  
    fuelUsed: 9.8,  
    status: "finalized",  
    deliveries: [  
      {  
        id: "del-005",  
        orderNumber: "CMD-2024-005",  
        customerName: "Brasserie du Centre",  
        address: "28 Rue de Rivoli, 75004 Paris",  
        timeWindow: "09:00 - 11:00",  
        actualDeliveryTime: "10:20",  
        status: "delivered",  
        products: [  
          {  
            id: "prod-005",  
            productName: "Bouteille Gaz Propane 35kg",  
            productCode: "PRO35",  
            quantityPlanned: 8,  
            quantityDelivered: 8,  
            unit: "bottles",  
          },  
        ],  
        customerNotes: "Livraison en cuisine, accès direct",  
      },  
    ],  
  },  
  {  
    routeId: "route-2024-003",  
    chauffeurId: "chauffeur-001",  
    truckId: "truck-001",  
    routeDate: "2024-01-13",  
    startTime: "07:45",  
    endTime: "18:15",  
    totalDeliveries: 6,  
    successfulDeliveries: 5,  
    failedDeliveries: 1,  
    partialDeliveries: 0,  
    totalDistance: 112.8,  
    fuelUsed: 16.2,  
    status: "finalized",  
    deliveries: [  
      {  
        id: "del-006",  
        orderNumber: "CMD-2024-006",  
        customerName: "Restaurant La Belle Époque",  
        address: "45 Avenue Montaigne, 75008 Paris",  
        timeWindow: "08:00 - 10:00",  
        actualDeliveryTime: "09:30",  
        status: "delivered",  
        products: [  
          {  
            id: "prod-006",  
            productName: "Bouteille Gaz Butane 13kg",  
            productCode: "BUT13",  
            quantityPlanned: 12,  
            quantityDelivered: 12,  
            unit: "bottles",  
          },  
        ],  
        customerNotes: "Livraison standard, client satisfait",  
      },  
    ],  
  },  
]  
  
const mockUser = {  
  id: "user-001",  
  name: "Jean Dupont",  
  role: "chauffeur",  
}  
  
const mockTruck = {  
  id: "truck-001",  
  plateNumber: "AB-123-CD",  
  model: "Mercedes Sprinter",  
}  
  
export default function RouteHistoryPage() {  
  // TOUS LES HOOKS EN PREMIER  
  const [routeHistories, setRouteHistories] = useState([])  
  const [selectedRoute, setSelectedRoute] = useState(null)  
  const [loading, setLoading] = useState(true)  
  
  // Charger les données au montage du composant  
  useEffect(() => {  
    const loadRouteHistories = async () => {  
      setLoading(true)  
      try {  
        // Simulate API call  
        await new Promise((resolve) => setTimeout(resolve, 1000))  
          
        // Trier les tournées par date (plus récente en premier)  
        const sortedRoutes = mockRouteHistories.sort((a, b) =>   
          new Date(b.routeDate) - new Date(a.routeDate)  
        )  
          
        setRouteHistories(sortedRoutes)  
        if (sortedRoutes.length > 0) {  
          setSelectedRoute(sortedRoutes[0])  
        }  
      } catch (error) {  
        console.error("Error loading route histories:", error)  
      } finally {  
        setLoading(false)  
      }  
    }  
  
    loadRouteHistories()  
  }, [])  
  
  // TOUTES LES FONCTIONS  
  const formatDate = (dateString) => {  
    const date = new Date(dateString)  
    return date.toLocaleDateString("fr-FR", {  
      weekday: "long",  
      day: "numeric",  
      month: "long",  
      year: "numeric"  
    })  
  }  
  
  const formatShortDate = (dateString) => {  
    const date = new Date(dateString)  
    return date.toLocaleDateString("fr-FR", {  
      day: "2-digit",  
      month: "2-digit",  
      year: "numeric"  
    })  
  }  
  
  const getStatusColor = (status) => {  
    switch (status) {  
      case "delivered":  
        return "rh-status-delivered"  
      case "partial":  
        return "rh-status-partial"  
      case "failed":  
        return "rh-status-failed"  
      default:  
        return "rh-status-default"  
    }  
  }  
  
  const getStatusText = (status) => {  
    switch (status) {  
      case "delivered":  
        return "Livré"  
      case "partial":  
        return "Partiel"  
      case "failed":  
        return "Échec"  
      default:  
        return status  
    }  
  }  
  
  const getStatusIcon = (status) => {  
    switch (status) {  
      case "delivered":  
        return <CheckCircle className="rh-status-icon" />  
      case "partial":  
        return <AlertTriangle className="rh-status-icon" />  
      case "failed":  
        return <XCircle className="rh-status-icon" />  
      default:  
        return null  
    }  
  }  
  
  const getIssueTypeText = (type) => {  
    switch (type) {  
      case "delay":  
        return "Retard"  
      case "customer_absent":  
        return "Client absent"  
      case "access_problem":  
        return "Problème d'accès"  
      case "product_issue":  
        return "Problème produit"  
      case "other":  
        return "Autre"  
      default:  
        return type  
    }  
  }  
  
  const calculateTotalProducts = (route) => {  
    if (!route) return 0  
    return route.deliveries.reduce((total, delivery) => {  
      return total + delivery.products.reduce((deliveryTotal, product) => {  
        return deliveryTotal + product.quantityDelivered  
      }, 0)  
    }, 0)  
  }  
  
  const calculateProductDiscrepancies = (route) => {  
    if (!route) return 0  
    return route.deliveries.reduce((total, delivery) => {  
      return total + delivery.products.reduce((deliveryTotal, product) => {  
        return deliveryTotal + Math.abs(product.discrepancy || 0)  
      }, 0)  
    }, 0)  
  }  
  
  const handleExportPDF = () => {  
    console.log("Exporting route summary as PDF...")  
  }  
  
  if (loading) {  
    return (  
      <div className="rh-layout">    
        <div className="rh-wrapper">  
          <div className="rh-loading">  
            <div className="rh-spinner" />  
            <p>Chargement de l'historique...</p>  
          </div>  
        </div>  
      </div>  
    )  
  }  
  
  return (  
    <div className="rh-layout">  
        
      <div className="rh-wrapper">  
        <div className="rh-container">  
          <div className="rh-content">  
            {/* Header */}  
            <div className="rh-header">  
              <div className="rh-header-left">  
                <div className="rh-title-section">  
                  <FileText className="rh-title-icon" />  
                  <h1 className="rh-title">Historique des Tournées</h1>  
                </div>  
              </div>  
            </div>  
  
            {/* Main Content */}  
            <div className="rh-main-grid">  
              {/* Left Column - Routes List by Day */}  
              <div className="rh-routes-list">  
                <div className="rh-card">  
                  <div className="rh-card-header">  
                    <h3 className="rh-card-title">  
                      Tournées par jour ({routeHistories.length})  
                    </h3>  
                  </div>  
                  <div className="rh-card-content">  
                    {routeHistories.length === 0 ? (  
                      <div className="rh-empty-state">  
                        <FileText className="rh-empty-icon" />  
                        <h3 className="rh-empty-title">Aucune tournée trouvée</h3>  
                        <p className="rh-empty-message">Aucune tournée finalisée n'a été trouvée.</p>  
                      </div>  
                    ) : (  
                      <div className="rh-routes-items">  
                        {routeHistories.map((route) => (  
                          <div  
                            key={route.routeId}  
                            className={`rh-route-item ${selectedRoute?.routeId === route.routeId ? 'rh-route-item-selected' : ''}`}  
                            onClick={() => setSelectedRoute(route)}  
                          >  
                            <div className="rh-route-header">  
                              <div className="rh-route-date">  
                                <Calendar className="rh-route-date-icon" />  
                                <div className="rh-date-info">  
                                  <span className="rh-date-main">{formatShortDate(route.routeDate)}</span>  
                                  <span className="rh-date-day">{formatDate(route.routeDate).split(',')[0]}</span>  
                                </div>  
                              </div>  
                              <div className="rh-route-status rh-status-finalized">  
                                Finalisée  
                              </div>  
                            </div>  
                            <div className="rh-route-summary">  
                              <div className="rh-route-info">  
                                <TruckIcon className="rh-truck-icon" />  
                                <span>{mockTruck.plateNumber}</span>  
                              </div>  
                              <div className="rh-route-stats">  
                                <span className="rh-stat">  
                                  <Package className="rh-stat-icon" />  
                                  {route.totalDeliveries} livraisons  
                                </span>  
                                <span className="rh-stat">  
                                  <MapPin className="rh-stat-icon" />  
                                  {route.totalDistance}km  
                                </span>  
                                <span className="rh-stat">  
                                  <Clock className="rh-stat-icon" />  
                                  {route.startTime} - {route.endTime}  
                                </span>  
                              </div>  
                            </div>  
                          </div>  
                        ))}  
                      </div>  
                    )}  
                  </div>  
                </div>  
              </div>  
  
              {/* Right Column - Route Details */}  
              <div className="rh-route-details">  
                {selectedRoute ? (  
                  <>  
                    {/* Route Overview */}  
                    <div className="rh-card">  
                      <div className="rh-card-header">  
                        <h3 className="rh-card-title">Détails de la Tournée</h3>  
                        <div className="rh-route-date-badge">  
                          {formatDate(selectedRoute.routeDate)}  
                        </div>  
                      </div>  
                      <div className="rh-card-content">  
                        <div className="rh-overview-info">  
                          <div className="rh-overview-item">  
                            <TruckIcon className="rh-overview-icon" />  
                            <span>{mockTruck.plateNumber} - {mockTruck.model}</span>  
                          </div>  
                          <div className="rh-overview-item">  
                            <Clock className="rh-overview-icon" />  
                            <span>{selectedRoute.startTime} - {selectedRoute.endTime}</span>  
                          </div>  
                          <div className="rh-overview-item">  
                            <MapPin className="rh-overview-icon" />  
                            <span>{selectedRoute.totalDistance}km parcourus</span>  
                          </div>  
                        </div>  
                      </div>  
                    </div>  
  
                    {/* Statistics Cards */}  
                    <div className="rh-stats-grid">  
                      <div className="rh-stat-card">  
                        <div className="rh-stat-content">  
                          <div className="rh-stat-info">  
                            <p className="rh-stat-label">Total Livraisons</p>  
                            <p className="rh-stat-value">{selectedRoute.totalDeliveries}</p>  
                          </div>  
                          <Package className="rh-stat-icon-large rh-text-blue" />  
                        </div>  
                      </div>  
  
                      <div className="rh-stat-card">  
                        <div className="rh-stat-content">  
                          <div className="rh-stat-info">  
                            <p className="rh-stat-label">Réussies</p>  
                            <p className="rh-stat-value rh-text-green">{selectedRoute.successfulDeliveries}</p>  
                          </div>  
                          <CheckCircle className="rh-stat-icon-large rh-text-green" />  
                        </div>  
                      </div>  
  
                      <div className="rh-stat-card">  
                        <div className="rh-stat-content">  
                          <div className="rh-stat-info">  
                            <p className="rh-stat-label">Partielles</p>  
                            <p className="rh-stat-value rh-text-orange">{selectedRoute.partialDeliveries}</p>  
                          </div>  
                          <AlertTriangle className="rh-stat-icon-large rh-text-orange" />  
                        </div>  
                      </div>  
  
                      <div className="rh-stat-card">  
                        <div className="rh-stat-content">  
                          <div className="rh-stat-info">  
                            <p className="rh-stat-label">Échecs</p>  
                            <p className="rh-stat-value rh-text-red">{selectedRoute.failedDeliveries}</p>  
                          </div>  
                          <XCircle className="rh-stat-icon-large rh-text-red" />  
                        </div>  
                      </div>  
                    </div>  
  
                    {/* Delivery Details */}  
                    <div className="rh-card">  
                      <div className="rh-card-header">  
                        <h3 className="rh-card-title">Détails des Livraisons</h3>  
                      </div>  
                      <div className="rh-card-content">  
                        <div className="rh-deliveries-list">  
                          {selectedRoute.deliveries.map((delivery, index) => (  
                            <div key={delivery.id} className="rh-delivery-item">  
                              <div className="rh-delivery-header">  
                                <div className="rh-delivery-info">  
                                  <h4 className="rh-delivery-customer">{delivery.customerName}</h4>  
                                  <div className={`rh-delivery-status ${getStatusColor(delivery.status)}`}>  
                                    {getStatusIcon(delivery.status)}  
                                    <span className="rh-status-text">{getStatusText(delivery.status)}</span>  
                                  </div>  
                                </div>  
                                <div className="rh-delivery-order">  
                                  Commande: {delivery.orderNumber}  
                                </div>  
                              </div>  
  
                              <div className="rh-delivery-address">  
                                <MapPin className="rh-address-icon" />  
                                {delivery.address}  
                              </div>  
  
                              <div className="rh-delivery-times">  
                                <div className="rh-time-item">  
                                  <span className="rh-time-label">Créneau prévu:</span>  
                                  <span className="rh-time-value">{delivery.timeWindow}</span>  
                                </div>  
                                <div className="rh-time-item">  
                                  <span className="rh-time-label">Heure de livraison:</span>  
                                  <span className="rh-time-value">{delivery.actualDeliveryTime || "Non livré"}</span>  
                                </div>  
                              </div>  
  
                              {/* Products */}  
                              <div className="rh-delivery-products">  
                                <h5 className="rh-products-title">Produits:</h5>  
                                <div className="rh-products-list">  
                                  {delivery.products.map((product) => (  
                                    <div key={product.id} className="rh-product-item">  
                                      <div className="rh-product-info">  
                                        <span className="rh-product-name">{product.productName}</span>  
                                        <span className="rh-product-code">({product.productCode})</span>  
                                      </div>  
                                      <div className="rh-product-quantity">  
                                        <span className={`rh-quantity ${  
                                          product.discrepancy  
                                            ? product.discrepancy < 0  
                                              ? "rh-text-red"  
                                              : "rh-text-orange"  
                                            : "rh-text-green"  
                                        }`}>  
                                          {product.quantityDelivered}/{product.quantityPlanned} {product.unit}  
                                        </span>  
                                        {product.discrepancy && (  
                                          <span className="rh-discrepancy-badge">  
                                            {product.discrepancy > 0 ? "+" : ""}  
                                            {product.discrepancy}  
                                          </span>  
                                        )}  
                                      </div>  
                                    </div>  
                                  ))}  
                                </div>  
                              </div>  
  
                              {/* Issues */}  
                              {delivery.issues && delivery.issues.length > 0 && (  
                                <div className="rh-delivery-issues">  
                                  <h5 className="rh-issues-title">Problèmes rencontrés:</h5>  
                                  <div className="rh-issues-list">  
                                    {delivery.issues.map((issue) => (  
                                      <div key={issue.id} className="rh-issue-item">  
                                        <AlertTriangle className="rh-issue-icon" />  
                                        <div className="rh-issue-content">  
                                          <span className="rh-issue-type">{getIssueTypeText(issue.type)}:</span>  
                                          <span className="rh-issue-description">{issue.description}</span>  
                                        </div>  
                                      </div>  
                                    ))}  
                                  </div>  
                                </div>  
                              )}  
  
                              {/* Customer Notes */}  
                              {delivery.customerNotes && (  
                                <div className="rh-customer-notes">  
                                  <p className="rh-notes-label">Notes client:</p>  
                                  <p className="rh-notes-text">{delivery.customerNotes}</p>  
                                </div>  
                              )}  
                            </div>  
                          ))}  
                        </div>  
                      </div>  
                    </div>  
  
                    {/* Summary and Actions */}  
                    <div className="rh-card">  
                      <div className="rh-card-header">  
                        <h3 className="rh-card-title">Résumé et Actions</h3>  
                      </div>  
                      <div className="rh-card-content">  
                        <div className="rh-summary-section">  
                          <div className="rh-summary-item">  
                            <span className="rh-summary-label">Total produits livrés:</span>  
                            <span className="rh-summary-value">{calculateTotalProducts(selectedRoute)}</span>  
                          </div>  
                          <div className="rh-summary-item">  
                            <span className="rh-summary-label">Écarts:</span>  
                            <span className="rh-summary-value rh-text-orange">{calculateProductDiscrepancies(selectedRoute)}</span>  
                          </div>  
                          <div className="rh-summary-item">  
                            <span className="rh-summary-label">Distance parcourue:</span>  
                            <span className="rh-summary-value">{selectedRoute.totalDistance}km</span>  
                          </div>  
                          <div className="rh-summary-item">  
                            <span className="rh-summary-label">Carburant utilisé:</span>  
                            <span className="rh-summary-value">{selectedRoute.fuelUsed}L</span>  
                          </div>  
                        </div>  
  
                        <div className="rh-separator" />  
  
                        <div className="rh-actions-section">  
                          <button onClick={handleExportPDF} className="rh-btn rh-btn-secondary">  
                            <Download className="rh-btn-icon" />  
                            Exporter PDF  
                          </button>  
                        </div>  
                      </div>  
                    </div>  
                  </>  
                ) : (  
                  <div className="rh-no-selection">  
                    <FileText className="rh-no-selection-icon" />  
                    <h3 className="rh-no-selection-title">Sélectionnez une tournée</h3>  
                    <p className="rh-no-selection-message">  
                      Choisissez une tournée dans la liste pour voir ses détails.  
                    </p>  
                  </div>  
                )}  
              </div>  
            </div>  
          </div>  
        </div>  
      </div>  
    </div>  
  )  
}