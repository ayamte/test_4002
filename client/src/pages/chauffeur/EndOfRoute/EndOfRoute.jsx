import React, { useState } from 'react'  
import { useNavigate } from 'react-router-dom'  
import {  
  MdLocalShipping as TruckIcon,  
  MdCheckCircle as CheckCircle,  
  MdCancel as XCircle,  
  MdWarning as AlertTriangle,  
  MdInventory as Package,  
  MdDescription as FileText,  
  MdDownload as Download,  
  MdHome as Home,  
  MdAccessTime as Clock,  
  MdLocationOn as MapPin,  
  MdArrowBack as ArrowLeft,  
  MdSave as Save,  
  MdPrint as Printer,  
} from 'react-icons/md'  
import './EndOfRoute.css'  
  
// Mock data basé sur votre code original  
const mockRouteEndSummary = {  
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
  status: "completed",  
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
}  
  
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
  
export default function EndOfRoutePage() {  
  // TOUS LES HOOKS EN PREMIER  
  const [routeSummary, setRouteSummary] = useState(mockRouteEndSummary)  
  const [generalNotes, setGeneralNotes] = useState("")  
  const [loading, setLoading] = useState(false)  
  const [isFinalized, setIsFinalized] = useState(false)  
  const [showConfirmation, setShowConfirmation] = useState(false)  
  const navigate = useNavigate()  
  
  // TOUTES LES FONCTIONS  
  const getStatusColor = (status) => {  
    switch (status) {  
      case "delivered":  
        return "eor-status-delivered"  
      case "partial":  
        return "eor-status-partial"  
      case "failed":  
        return "eor-status-failed"  
      default:  
        return "eor-status-default"  
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
        return <CheckCircle className="eor-status-icon" />  
      case "partial":  
        return <AlertTriangle className="eor-status-icon" />  
      case "failed":  
        return <XCircle className="eor-status-icon" />  
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
  
  const calculateTotalProducts = () => {  
    return routeSummary.deliveries.reduce((total, delivery) => {  
      return total + delivery.products.reduce((deliveryTotal, product) => {  
        return deliveryTotal + product.quantityDelivered  
      }, 0)  
    }, 0)  
  }  
  
  const calculateProductDiscrepancies = () => {  
    return routeSummary.deliveries.reduce((total, delivery) => {  
      return total + delivery.products.reduce((deliveryTotal, product) => {  
        return deliveryTotal + Math.abs(product.discrepancy || 0)  
      }, 0)  
    }, 0)  
  }  
  
  const handleFinalizeRoute = async () => {  
    setLoading(true)  
    try {  
      // Simulate API call  
      await new Promise((resolve) => setTimeout(resolve, 2000))  
  
      setRouteSummary((prev) => ({  
        ...prev,  
        generalNotes,  
        finalizedAt: new Date().toISOString(),  
        status: "finalized",  
      }))  
  
      setIsFinalized(true)  
      setShowConfirmation(true)  
    } catch (error) {  
      console.error("Error finalizing route:", error)  
    } finally {  
      setLoading(false)  
    }  
  }  
  
  const handleExportPDF = () => {  
    console.log("Exporting route summary as PDF...")  
  }  
  
  const handleExportCSV = () => {  
    console.log("Exporting route summary as CSV...")  
  }  
  
  // CONDITIONS DE RETOUR APRÈS TOUS LES HOOKS  
  if (showConfirmation) {  
    return (  
      <div className="eor-layout">  
        <div className="eor-wrapper">  
          <div className="eor-confirmation-container">  
            <div className="eor-confirmation-card">  
              <div className="eor-confirmation-content">  
                <div className="eor-confirmation-icon">  
                  <CheckCircle className="eor-icon-large eor-text-green" />  
                </div>  
                <h3 className="eor-confirmation-title">Tournée Finalisée</h3>  
                <p className="eor-confirmation-message">  
                  Votre tournée du {routeSummary.routeDate} a été finalisée avec succès.  
                </p>  
                <div className="eor-confirmation-actions">  
                  <button   
                    onClick={() => navigate('/dashboard')}  
                    className="eor-btn eor-btn-primary"  
                  >  
                    <Home className="eor-btn-icon" />  
                    Retour au tableau de bord  
                  </button>  
                  <button   
                    onClick={handleExportPDF}  
                    className="eor-btn eor-btn-secondary"  
                  >  
                    <Download className="eor-btn-icon" />  
                    Télécharger le résumé  
                  </button>  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
      </div>  
    )  
  }  
  
  return (  
    <div className="eor-layout">  
      <div className="eor-wrapper">  
        <div className="eor-container">  
          <div className="eor-content">  
            {/* Header */}  
            <div className="eor-header">  
              <div className="eor-header-left">  
                <button   
                  onClick={() => navigate(-1)}  
                  className="eor-back-button"  
                >  
                  <ArrowLeft className="eor-back-icon" />  
                  Retour  
                </button>  
                <div className="eor-title-section">  
                  <FileText className="eor-title-icon" />  
                  <h1 className="eor-title">Fin de Tournée</h1>  
                </div>  
              </div>  
            </div>  
  
            {/* Route Overview */}  
            <div className="eor-overview">  
              <h2 className="eor-overview-title">Résumé de Tournée</h2>  
              <div className="eor-overview-info">  
                <div className="eor-overview-item">  
                  <TruckIcon className="eor-overview-icon" />  
                  <span>{mockTruck.plateNumber}</span>  
                </div>  
                <div className="eor-overview-item">  
                  <Clock className="eor-overview-icon" />  
                  <span>{routeSummary.startTime} - {routeSummary.endTime || "En cours"}</span>  
                </div>  
                <div className="eor-overview-item">  
                  <MapPin className="eor-overview-icon" />  
                  <span>{routeSummary.totalDistance}km parcourus</span>  
                </div>  
              </div>  
            </div>  
  
            {/* Statistics Cards */}  
            <div className="eor-stats-grid">  
              <div className="eor-stat-card">  
                <div className="eor-stat-content">  
                  <div className="eor-stat-info">  
                    <p className="eor-stat-label">Total Livraisons</p>  
                    <p className="eor-stat-value">{routeSummary.totalDeliveries}</p>  
                  </div>  
                  <Package className="eor-stat-icon eor-text-blue" />  
                </div>  
              </div>  
  
              <div className="eor-stat-card">  
                <div className="eor-stat-content">  
                  <div className="eor-stat-info">  
                    <p className="eor-stat-label">Réussies</p>  
                    <p className="eor-stat-value eor-text-green">{routeSummary.successfulDeliveries}</p>  
                  </div>  
                  <CheckCircle className="eor-stat-icon eor-text-green" />  
                </div>  
              </div>  
  
              <div className="eor-stat-card">  
                <div className="eor-stat-content">  
                  <div className="eor-stat-info">  
                    <p className="eor-stat-label">Partielles</p>  
                    <p className="eor-stat-value eor-text-orange">{routeSummary.partialDeliveries}</p>  
                  </div>  
                  <AlertTriangle className="eor-stat-icon eor-text-orange" />  
                </div>  
              </div>  
  
              <div className="eor-stat-card">  
                <div className="eor-stat-content">  
                  <div className="eor-stat-info">  
                    <p className="eor-stat-label">Échecs</p>  
                    <p className="eor-stat-value eor-text-red">{routeSummary.failedDeliveries}</p>  
                  </div>  
                  <XCircle className="eor-stat-icon eor-text-red" />  
                </div>  
              </div>  
  
              <div className="eor-stat-card">  
                <div className="eor-stat-content">  
                  <div className="eor-stat-info">  
                    <p className="eor-stat-label">Produits Livrés</p>  
                    <p className="eor-stat-value">{calculateTotalProducts()}</p>  
                  </div>  
                  <Package className="eor-stat-icon eor-text-gray" />  
                </div>  
              </div>  
            </div>  
  
            <div className="eor-main-grid">  
              {/* Left Column - Delivery Details */}  
              <div className="eor-left-column">  
                <div className="eor-card">  
                  <div className="eor-card-header">  
                    <h3 className="eor-card-title">Détails des Livraisons</h3>  
                  </div>  
                  <div className="eor-card-content">  
                    <div className="eor-deliveries-list">  
                      {routeSummary.deliveries.map((delivery, index) => (  
                        <div key={delivery.id} className="eor-delivery-item">  
                          <div className="eor-delivery-header">  
                            <div className="eor-delivery-info">  
                              <h4 className="eor-delivery-customer">{delivery.customerName}</h4>  
                              <div className={`eor-delivery-status ${getStatusColor(delivery.status)}`}>  
                                {getStatusIcon(delivery.status)}  
                                <span className="eor-status-text">{getStatusText(delivery.status)}</span>  
                              </div>  
                            </div>  
                          </div>  
  
                          <div className="eor-delivery-order">  
                            Commande: {delivery.orderNumber}  
                          </div>  
  
                          <div className="eor-delivery-address">  
                            <MapPin className="eor-address-icon" />  
                            {delivery.address}  
                          </div>  
  
                          <div className="eor-delivery-times">  
                            <div className="eor-time-item">  
                              <span className="eor-time-label">Créneau prévu:</span>  
                              <span className="eor-time-value">{delivery.timeWindow}</span>  
                            </div>  
                            <div className="eor-time-item">  
                              <span className="eor-time-label">Heure de livraison:</span>  
                              <span className="eor-time-value">{delivery.actualDeliveryTime || "Non livré"}</span>  
                            </div>  
                          </div>  
  
                          {/* Products */}  
                          <div className="eor-delivery-products">  
                            <h5 className="eor-products-title">Produits:</h5>  
                            <div className="eor-products-list">  
                              {delivery.products.map((product) => (  
                                <div key={product.id} className="eor-product-item">  
                                  <div className="eor-product-info">  
                                    <span className="eor-product-name">{product.productName}</span>  
                                    <span className="eor-product-code">({product.productCode})</span>  
                                  </div>  
                                  <div className="eor-product-quantity">  
                                    <span className={`eor-quantity ${  
                                      product.discrepancy  
                                        ? product.discrepancy < 0  
                                          ? "eor-text-red"  
                                          : "eor-text-orange"  
                                        : "eor-text-green"  
                                    }`}>  
                                      {product.quantityDelivered}/{product.quantityPlanned} {product.unit}  
                                    </span>  
                                    {product.discrepancy && (  
                                      <span className="eor-discrepancy-badge">  
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
                            <div className="eor-delivery-issues">  
                              <h5 className="eor-issues-title">Problèmes rencontrés:</h5>  
                              <div className="eor-issues-list">  
                                {delivery.issues.map((issue) => (  
                                  <div key={issue.id} className="eor-issue-item">  
                                    <AlertTriangle className="eor-issue-icon" />  
                                    <div className="eor-issue-content">  
                                      <span className="eor-issue-type">{getIssueTypeText(issue.type)}:</span>  
                                      <span className="eor-issue-description">{issue.description}</span>  
                                    </div>  
                                  </div>  
                                ))}  
                              </div>  
                            </div>  
                          )}  
  
                          {/* Customer Notes */}  
                          {delivery.customerNotes && (  
                            <div className="eor-customer-notes">  
                              <p className="eor-notes-label">Notes client:</p>  
                              <p className="eor-notes-text">{delivery.customerNotes}</p>  
                            </div>  
                          )}  
                        </div>  
                      ))}  
                    </div>  
                  </div>  
                </div>  
              </div>  
  
              {/* Right Column - Summary and Actions */}  
              <div className="eor-right-column">  
                {/* Product Summary */}  
                <div className="eor-card">  
                  <div className="eor-card-header">  
                    <h3 className="eor-card-title">Résumé Produits</h3>  
                  </div>  
                  <div className="eor-card-content">  
                    <div className="eor-summary-section">  
                      <div className="eor-summary-item">  
                        <span className="eor-summary-label">Total produits livrés:</span>  
                        <span className="eor-summary-value">{calculateTotalProducts()}</span>  
                      </div>  
                      <div className="eor-summary-item">  
                        <span className="eor-summary-label">Écarts:</span>  
                        <span className="eor-summary-value eor-text-orange">{calculateProductDiscrepancies()}</span>  
                      </div>  
                      <div className="eor-summary-item">  
                        <span className="eor-summary-label">Distance parcourue:</span>  
                        <span className="eor-summary-value">{routeSummary.totalDistance}km</span>  
                      </div>  
                      <div className="eor-summary-item">  
                        <span className="eor-summary-label">Carburant utilisé:</span>  
                        <span className="eor-summary-value">{routeSummary.fuelUsed}L</span>  
                      </div>  
                    </div>  
                  </div>  
                </div>  
  
                {/* General Notes */}  
                <div className="eor-card">  
                  <div className="eor-card-header">  
                    <h3 className="eor-card-title">Notes Générales</h3>  
                  </div>  
                  <div className="eor-card-content">  
                    <div className="eor-form-group">  
                      <label htmlFor="general-notes" className="eor-label">Observations de la tournée</label>  
                      <textarea  
                        id="general-notes"  
                        value={generalNotes}  
                        onChange={(e) => setGeneralNotes(e.target.value)}  
                        placeholder="Ajoutez vos observations sur la tournée, problèmes rencontrés, suggestions d'amélioration..."  
                        rows={4}  
                        disabled={isFinalized}  
                        className="eor-textarea"  
                      />  
                    </div>  
                  </div>  
                </div>  
  
                {/* Actions */}  
                <div className="eor-card">  
                  <div className="eor-card-header">  
                    <h3 className="eor-card-title">Actions</h3>  
                  </div>  
                  <div className="eor-card-content">  
                    <div className="eor-actions-section">  
                      {!isFinalized ? (  
                        <button   
                          onClick={handleFinalizeRoute}   
                          disabled={loading}   
                          className="eor-btn eor-btn-primary eor-btn-large"  
                        >  
                          {loading ? (  
                            <>  
                              <div className="eor-spinner" />  
                              Finalisation...  
                            </>  
                          ) : (  
                            <>  
                              <Save className="eor-btn-icon" />  
                              Finaliser la Tournée  
                            </>  
                          )}  
                        </button>  
                      ) : (  
                        <div className="eor-finalized-state">  
                          <CheckCircle className="eor-finalized-icon eor-text-green" />  
                          <p className="eor-finalized-text">Tournée finalisée</p>  
                        </div>  
                      )}  
  
                      <div className="eor-separator" />  
  
                      <div className="eor-export-actions">  
                        <button onClick={handleExportPDF} className="eor-btn eor-btn-secondary">  
                          <Download className="eor-btn-icon" />  
                          Exporter PDF  
                        </button>  
                        <button onClick={handleExportCSV} className="eor-btn eor-btn-secondary">  
                          <FileText className="eor-btn-icon" />  
                          Exporter CSV  
                        </button>  
                        <button className="eor-btn eor-btn-secondary">  
                          <Printer className="eor-btn-icon" />  
                          Imprimer  
                        </button>  
                      </div>  
  
                      <div className="eor-separator" />  
  
                      <button   
                        onClick={() => navigate('/dashboard')}  
                        className="eor-btn eor-btn-secondary"  
                      >  
                        <Home className="eor-btn-icon" />  
                        Retour au Tableau de Bord  
                      </button>  
                    </div>  
                  </div>  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
      </div>  
    </div>  
  )  
}