import React, { useState, useEffect } from 'react'
import {
  MdLocalShipping as TruckIcon,
  MdInventory as Package,
  MdLocationOn as MapPin,
  MdPerson as User,
  MdWarning as AlertTriangle,
  MdCheckCircle as CheckCircle,
  MdCancel as XCircle,
  MdSave as Save,
  MdVisibility as Eye,
  MdHome as Home,
  MdWarehouse as Warehouse,
  MdAssignmentTurnedIn as ClipboardCheck,
} from 'react-icons/md'
import './TruckUnloading.css'

// Mock data
const mockTruck = {
  id: "truck-001",
  plateNumber: "AB-123-CD",
  model: "Mercedes Sprinter",
  driverId: "driver-001",
  driverName: "Jean Dupont",
}

const mockDepot = {
  id: "depot-001",
  name: "Dépôt Central Paris",
  address: "123 Avenue de la République, 75011 Paris",
  code: "PAR-01",
  managerName: "Marie Dubois",
}

const mockUnloadingSession = {
  id: "unload-001",
  truckId: "truck-001",
  depotId: "depot-001",
  routeSessionId: "route-2024-001",
  unloadingDate: new Date().toISOString().split("T")[0],
  startTime: new Date().toISOString(),
  status: "in-progress",
  unloadedBy: "Jean Dupont",
  totalDiscrepancies: 0,
  products: [
    {
      id: "prod-001",
      productName: "Bouteille Gaz Butane 13kg",
      productCode: "BUT13",
      quantityLoaded: 20,
      quantityUnloaded: 0,
      quantityReturned: 8, // 20 loaded - 12 delivered = 8 returned
      unit: "bottles",
      batchNumber: "BAT-2024-001",
      expiryDate: "2025-12-31",
      condition: "good",
    },
    {
      id: "prod-002",
      productName: "Bouteille Gaz Propane 35kg",
      productCode: "PRO35",
      quantityLoaded: 10,
      quantityUnloaded: 0,
      quantityReturned: 5, // 10 loaded - 5 delivered = 5 returned
      unit: "bottles",
      batchNumber: "BAT-2024-002",
      expiryDate: "2025-11-30",
      condition: "good",
    },
    {
      id: "prod-003",
      productName: "Bouteille Gaz Butane 6kg",
      productCode: "BUT06",
      quantityLoaded: 25,
      quantityUnloaded: 0,
      quantityReturned: 10, // 25 loaded - 15 delivered = 10 returned
      unit: "bottles",
      batchNumber: "BAT-2024-003",
      expiryDate: "2025-10-31",
      condition: "good",
    },
    {
      id: "prod-004",
      productName: "Détendeur Butane",
      productCode: "DET-BUT",
      quantityLoaded: 30,
      quantityUnloaded: 0,
      quantityReturned: 10, // 30 loaded - 20 delivered = 10 returned
      unit: "units",
      condition: "good",
    },
  ],
}

const mockUser = {
  id: "user-001",
  name: "Jean Dupont",
  role: "chauffeur",
}

export default function TruckUnloadingPage() {
  // TOUS LES HOOKS EN PREMIER
  const [unloadingSession, setUnloadingSession] = useState(mockUnloadingSession)
  const [generalNotes, setGeneralNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Calculate total discrepancies when products change
  useEffect(() => {
    const discrepancies = unloadingSession.products.reduce((total, product) => {
      const discrepancy = Math.abs(product.quantityReturned - product.quantityUnloaded)
      return total + discrepancy
    }, 0)

    setUnloadingSession((prev) => ({
      ...prev,
      totalDiscrepancies: discrepancies,
    }))
  }, [unloadingSession.products])

  // TOUTES LES FONCTIONS
  const updateProductUnloaded = (productId, quantityUnloaded) => {
    setUnloadingSession((prev) => ({
      ...prev,
      products: prev.products.map((product) => 
        product.id === productId ? { ...product, quantityUnloaded } : product
      ),
    }))
  }

  const updateProductCondition = (productId, condition) => {
    setUnloadingSession((prev) => ({
      ...prev,
      products: prev.products.map((product) => 
        product.id === productId ? { ...product, condition } : product
      ),
    }))
  }

  const updateProductNotes = (productId, notes) => {
    setUnloadingSession((prev) => ({
      ...prev,
      products: prev.products.map((product) => 
        product.id === productId ? { ...product, notes } : product
      ),
    }))
  }

  const getConditionColor = (condition) => {
    switch (condition) {
      case "good":
        return "tu-condition-good"
      case "damaged":
        return "tu-condition-damaged"
      case "expired":
        return "tu-condition-expired"
      default:
        return "tu-condition-default"
    }
  }

  const getConditionText = (condition) => {
    switch (condition) {
      case "good":
        return "Bon état"
      case "damaged":
        return "Endommagé"
      case "expired":
        return "Expiré"
      default:
        return condition
    }
  }

  const getConditionIcon = (condition) => {
    switch (condition) {
      case "good":
        return <CheckCircle className="tu-condition-icon" />
      case "damaged":
        return <XCircle className="tu-condition-icon" />
      case "expired":
        return <AlertTriangle className="tu-condition-icon" />
      default:
        return null
    }
  }

  const validateUnloading = () => {
    const validationErrors = []

    // Check if all products have been processed
    const unprocessedProducts = unloadingSession.products.filter((product) => product.quantityUnloaded === 0)
    if (unprocessedProducts.length > 0) {
      validationErrors.push("Certains produits n'ont pas encore été déchargés.")
    }

    // Check for major discrepancies
    const majorDiscrepancies = unloadingSession.products.filter((product) => {
      const discrepancy = Math.abs(product.quantityReturned - product.quantityUnloaded)
      return discrepancy > 0
    })

    if (majorDiscrepancies.length > 0) {
      validationErrors.push(
        `${majorDiscrepancies.length} produit(s) présentent des écarts entre les quantités attendues et déchargées.`,
      )
    }

    return validationErrors
  }

  const handleCompleteUnloading = async () => {
    const validationErrors = validateUnloading()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setUnloadingSession((prev) => ({
        ...prev,
        status: "completed",
        endTime: new Date().toISOString(),
        generalNotes,
      }))

      setShowConfirmation(true)
      setErrors([])
    } catch (error) {
      setErrors(["Erreur lors de la finalisation du déchargement. Veuillez réessayer."])
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewInventory = () => {
    setShowPreview(true)
  }

  const closePreview = () => {
    setShowPreview(false)
  }

  const calculateTotalReturned = () => {
    return unloadingSession.products.reduce((total, product) => total + product.quantityReturned, 0)
  }

  const calculateTotalUnloaded = () => {
    return unloadingSession.products.reduce((total, product) => total + product.quantityUnloaded, 0)
  }

  // CONDITIONS DE RETOUR APRÈS TOUS LES HOOKS
  if (showConfirmation) {
    return (
      <div className="tu-layout">
        <div className="tu-wrapper">
          <div className="tu-confirmation-container">
            <div className="tu-confirmation-card">
              <div className="tu-confirmation-content">
                <div className="tu-confirmation-icon">
                  <CheckCircle className="tu-icon-large tu-text-green" />
                </div>
                <h3 className="tu-confirmation-title">Déchargement Terminé</h3>
                <p className="tu-confirmation-message">
                  Le déchargement du camion {mockTruck.plateNumber} a été finalisé avec succès.
                </p>
                <div className="tu-confirmation-actions">
                  <button className="tu-btn tu-btn-primary">
                    <Eye className="tu-btn-icon" />
                    Voir l'Inventaire
                  </button>
                  <button className="tu-btn tu-btn-secondary">
                    <Home className="tu-btn-icon" />
                    Retour au Tableau de Bord
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showPreview) {
    return (
      <div className="tu-layout">
        <div className="tu-wrapper">
          <div className="tu-preview-overlay">
            <div className="tu-preview-modal">
              <div className="tu-preview-header">
                <h2 className="tu-preview-title">Aperçu Inventaire</h2>
                <button onClick={closePreview} className="tu-preview-close">×</button>
              </div>
              
              <div className="tu-preview-content">
                <div className="tu-preview-section">
                  <h3 className="tu-preview-section-title">Informations Générales</h3>
                  <div className="tu-preview-info">
                    <p><strong>Camion:</strong> {mockTruck.plateNumber} - {mockTruck.model}</p>
                    <p><strong>Dépôt:</strong> {mockDepot.name} ({mockDepot.code})</p>
                    <p><strong>Date:</strong> {unloadingSession.unloadingDate}</p>
                    <p><strong>Chauffeur:</strong> {mockTruck.driverName}</p>
                  </div>
                </div>

                <div className="tu-preview-section">
                  <h3 className="tu-preview-section-title">Résumé du Déchargement</h3>
                  <div className="tu-preview-summary">
                    <p><strong>Produits à retourner:</strong> {calculateTotalReturned()}</p>
                    <p><strong>Produits déchargés:</strong> {calculateTotalUnloaded()}</p>
                    <p><strong>Écarts détectés:</strong> {unloadingSession.totalDiscrepancies}</p>
                  </div>
                </div>

                <div className="tu-preview-section">
                  <h3 className="tu-preview-section-title">Détail des Produits</h3>
                  <ul className="tu-preview-products">
                    {unloadingSession.products.map((product) => (
                      <li key={product.id} className="tu-preview-product-item">
                        <div className="tu-preview-product-main">
                          <strong>{product.productName}</strong> ({product.productCode})
                        </div>
                        <div className="tu-preview-product-details">
                          Chargé: {product.quantityLoaded} {product.unit} | 
                          À retourner: {product.quantityReturned} {product.unit} | 
                          Déchargé: {product.quantityUnloaded} {product.unit}
                        </div>
                        <div className="tu-preview-product-condition">
                          État: {getConditionText(product.condition)}
                        </div>
                        {product.notes && (
                          <div className="tu-preview-product-notes">
                            Notes: {product.notes}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tu-preview-section">
                  <h3 className="tu-preview-section-title">Notes Générales</h3>
                  <p className="tu-preview-notes">
                    {generalNotes || "Aucune note."}
                  </p>
                </div>
              </div>

              <div className="tu-preview-actions">
                <button onClick={closePreview} className="tu-btn tu-btn-secondary">
                  Fermer l'Aperçu
                </button>
                <button 
                  onClick={() => {
                    closePreview();
                    handleCompleteUnloading();
                  }}
                  disabled={loading}
                  className="tu-btn tu-btn-primary"
                >
                  Finaliser le Déchargement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Return principal
  return (
    <div className="tu-layout">
      
      <div className="tu-wrapper">
        <div className="tu-container">
          <div className="tu-content">
            {/* Header */}
            <div className="tu-header">
              <div className="tu-header-left">
                <div className="tu-title-section">
                  <Warehouse className="tu-title-icon" />
                  <h1 className="tu-title">Déchargement Dépôt</h1>
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="tu-alert tu-alert-error">
                <AlertTriangle className="tu-alert-icon" />
                <div className="tu-alert-content">
                  <ul className="tu-error-list">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="tu-grid">
              {/* Left Column - Truck and Depot Info */}
              <div className="tu-left-column">
                {/* Truck Information */}
                <div className="tu-card">
                  <div className="tu-card-header">
                    <h3 className="tu-card-title">
                      <TruckIcon className="tu-card-icon" />
                      Informations Camion
                    </h3>
                  </div>
                  <div className="tu-card-content">
                    <div className="tu-info-section">
                      <div className="tu-info-item">
                        <label className="tu-info-label">Plaque d'immatriculation</label>
                        <p className="tu-info-value tu-info-value-large">{mockTruck.plateNumber}</p>
                      </div>
                      <div className="tu-info-item">
                        <label className="tu-info-label">Modèle</label>
                        <p className="tu-info-value">{mockTruck.model}</p>
                      </div>
                      <div className="tu-info-item">
                        <label className="tu-info-label">Chauffeur</label>
                        <div className="tu-driver-info">
                          <User className="tu-driver-icon" />
                          <p className="tu-info-value">{mockTruck.driverName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Depot Information */}
                <div className="tu-card">
                  <div className="tu-card-header">
                    <h3 className="tu-card-title">
                      <MapPin className="tu-card-icon" />
                      Informations Dépôt
                    </h3>
                  </div>
                  <div className="tu-card-content">
                    <div className="tu-info-section">
                      <div className="tu-info-item">
                        <label className="tu-info-label">Nom du dépôt</label>
                        <p className="tu-info-value">{mockDepot.name}</p>
                        <p className="tu-depot-code">({mockDepot.code})</p>
                      </div>
                      <div className="tu-info-item">
                        <label className="tu-info-label">Adresse</label>
                        <p className="tu-depot-address">{mockDepot.address}</p>
                      </div>
                      <div className="tu-info-item">
                        <label className="tu-info-label">Responsable</label>
                        <p className="tu-info-value">{mockDepot.managerName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="tu-card">
                  <div className="tu-card-header">
                    <h3 className="tu-card-title">
                      <ClipboardCheck className="tu-card-icon" />
                      Résumé
                    </h3>
                  </div>
                  <div className="tu-card-content">
                    <div className="tu-summary-section">
                      <div className="tu-summary-item">
                        <span className="tu-summary-label">Produits à retourner:</span>
                        <span className="tu-summary-value">{calculateTotalReturned()}</span>
                      </div>
                      <div className="tu-summary-item">
                        <span className="tu-summary-label">Produits déchargés:</span>
                        <span className="tu-summary-value tu-text-green">{calculateTotalUnloaded()}</span>
                      </div>
                      <div className="tu-summary-item">
                        <span className="tu-summary-label">Écarts détectés:</span>
                        <span className={`tu-summary-value ${
                          unloadingSession.totalDiscrepancies > 0 ? "tu-text-red" : "tu-text-green"
                        }`}>
                          {unloadingSession.totalDiscrepancies}
                        </span>
                      </div>
                    </div>

                    {unloadingSession.totalDiscrepancies > 0 && (
                      <div className="tu-alert tu-alert-warning">
                        <AlertTriangle className="tu-alert-icon" />
                        <div className="tu-alert-content">
                          Des écarts ont été détectés. Veuillez vérifier les quantités avant de finaliser.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Products */}
              <div className="tu-right-column">
                {/* Products List */}
                <div className="tu-card">
                  <div className="tu-card-header">
                    <div className="tu-card-title-with-badge">
                      <h3 className="tu-card-title">
                        <Package className="tu-card-icon" />
                        Produits à Décharger
                      </h3>
                      <span className="tu-badge">{unloadingSession.products.length} produits</span>
                    </div>
                  </div>
                  <div className="tu-card-content">
                    <div className="tu-products-list">
                      {unloadingSession.products.map((product) => (
                        <div key={product.id} className="tu-product-item">
                          <div className="tu-product-header">
                            <div className="tu-product-info">
                              <h4 className="tu-product-name">{product.productName}</h4>
                              <p className="tu-product-code">Code: {product.productCode}</p>
                              {product.batchNumber && (
                                <p className="tu-product-batch">Lot: {product.batchNumber}</p>
                              )}
                            </div>
                            <div className={`tu-condition-badge ${getConditionColor(product.condition)}`}>
                              {getConditionIcon(product.condition)}
                              <span className="tu-condition-text">{getConditionText(product.condition)}</span>
                            </div>
                          </div>

                          <div className="tu-product-quantities">
                            <div className="tu-quantity-item">
                              <label className="tu-quantity-label">Quantité chargée</label>
                              <p className="tu-quantity-value">
                                {product.quantityLoaded} {product.unit}
                              </p>
                            </div>
                            <div className="tu-quantity-item">
                              <label className="tu-quantity-label">Quantité à retourner</label>
                              <p className="tu-quantity-value tu-text-blue">
                                {product.quantityReturned} {product.unit}
                              </p>
                            </div>
                            <div className="tu-quantity-item">
                              <label htmlFor={`unloaded-${product.id}`} className="tu-quantity-label">
                                Quantité déchargée
                              </label>
                              <input
                                id={`unloaded-${product.id}`}
                                type="number"
                                min="0"
                                max={product.quantityReturned}
                                value={product.quantityUnloaded}
                                onChange={(e) => updateProductUnloaded(product.id, parseInt(e.target.value) || 0)}
                                className="tu-input tu-quantity-input"
                                placeholder="Entrez la quantité"
                              />
                            </div>
                          </div>

                          <div className="tu-product-details">
                            <div className="tu-detail-item">
                              <label className="tu-detail-label">État du produit</label>
                              <select
                                value={product.condition}
                                onChange={(e) => updateProductCondition(product.id, e.target.value)}
                                className="tu-select"
                              >
                                <option value="good">Bon état</option>
                                <option value="damaged">Endommagé</option>
                                <option value="expired">Expiré</option>
                              </select>
                            </div>
                            {product.expiryDate && (
                              <div className="tu-detail-item">
                                <label className="tu-detail-label">Date d'expiration</label>
                                <p className="tu-expiry-date">{product.expiryDate}</p>
                              </div>
                            )}
                          </div>

                          <div className="tu-product-notes-section">
                            <label htmlFor={`notes-${product.id}`} className="tu-notes-label">
                              Notes (optionnel)
                            </label>
                            <textarea
                              id={`notes-${product.id}`}
                              value={product.notes || ""}
                              onChange={(e) => updateProductNotes(product.id, e.target.value)}
                              placeholder="Observations sur l'état du produit, dommages, etc..."
                              rows={2}
                              className="tu-textarea"
                            />
                          </div>

                          {/* Discrepancy Alert */}
                          {Math.abs(product.quantityReturned - product.quantityUnloaded) > 0 &&
                            product.quantityUnloaded > 0 && (
                              <div className="tu-alert tu-alert-warning tu-discrepancy-alert">
                                <AlertTriangle className="tu-alert-icon" />
                                <div className="tu-alert-content">
                                  Écart détecté: {Math.abs(product.quantityReturned - product.quantityUnloaded)}{" "}
                                  {product.unit}{" "}
                                  {product.quantityUnloaded > product.quantityReturned ? "en excès" : "manquant"}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* General Notes and Actions */}
                <div className="tu-card">
                  <div className="tu-card-header">
                    <h3 className="tu-card-title">Notes Générales et Finalisation</h3>
                  </div>
                  <div className="tu-card-content">
                    <div className="tu-form-group">
                      <label htmlFor="general-notes" className="tu-label">Observations générales</label>
                      <textarea
                        id="general-notes"
                        value={generalNotes}
                        onChange={(e) => setGeneralNotes(e.target.value)}
                        placeholder="Notes sur le déchargement, problèmes rencontrés, état général des produits..."
                        rows={4}
                        className="tu-textarea"
                      />
                    </div>

                    <div className="tu-separator" />

                    <div className="tu-action-buttons">
                      <button
                        onClick={handleCompleteUnloading}
                        disabled={loading}
                        className="tu-btn tu-btn-primary tu-btn-large"
                      >
                        {loading ? (
                          <>
                            <div className="tu-spinner" />
                            Finalisation...
                          </>
                        ) : (
                          <>
                            <Save className="tu-btn-icon" />
                            Finaliser le Déchargement
                          </>
                        )}
                      </button>

                      <button
                        onClick={handlePreviewInventory}
                        className="tu-btn tu-btn-secondary tu-btn-large"
                      >
                        <Eye className="tu-btn-icon" />
                        Aperçu Inventaire
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