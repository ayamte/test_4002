import React, { useState, useEffect } from 'react'
import {
  MdLocalShipping as TruckIcon,
  MdAdd as Plus,
  MdDelete as Trash2,
  MdCheckCircle as CheckCircle,
  MdWarning as AlertTriangle,
  MdLocationOn as MapPin,
  MdAssignment as ClipboardList,
  MdSave as Save,
  MdInventory as Package
} from 'react-icons/md'
import './TruckLoading.css'

// Mock data
const mockTrucks = [
  {
    id: "truck-001",
    plateNumber: "AB-123-CD",
    model: "Mercedes Sprinter",
    capacity: { weight: 3500, volume: 15.5 },
  },
  {
    id: "truck-002",
    plateNumber: "EF-456-GH",
    model: "Iveco Daily",
    capacity: { weight: 3000, volume: 12.0 },
  },
  {
    id: "truck-003",
    plateNumber: "IJ-789-KL",
    model: "Renault Master",
    capacity: { weight: 2800, volume: 13.2 },
  },
]

const mockDepots = [
  {
    id: "depot-001",
    name: "Dépôt Central Paris",
    address: "123 Avenue de la République, 75011 Paris",
    code: "PAR-01",
  },
  {
    id: "depot-002",
    name: "Dépôt Nord",
    address: "45 Rue du Commerce, 93200 Saint-Denis",
    code: "NOR-01",
  },
  {
    id: "depot-003",
    name: "Dépôt Sud",
    address: "78 Boulevard Périphérique, 94200 Ivry-sur-Seine",
    code: "SUD-01",
  },
]

const mockProductTypes = [
  {
    id: "prod-001",
    name: "Bouteille Gaz Butane 13kg",
    code: "BUT13",
    defaultUnit: "bottles",
    availableUnits: ["bottles", "kg"],
    weightPerUnit: 15.0,
    volumePerUnit: 0.25,
  },
  {
    id: "prod-002",
    name: "Bouteille Gaz Propane 35kg",
    code: "PRO35",
    defaultUnit: "bottles",
    availableUnits: ["bottles", "kg"],
    weightPerUnit: 40.0,
    volumePerUnit: 0.64,
  },
  {
    id: "prod-003",
    name: "Bouteille Gaz Butane 6kg",
    code: "BUT06",
    defaultUnit: "bottles",
    availableUnits: ["bottles", "kg"],
    weightPerUnit: 6.67,
    volumePerUnit: 0.12,
  },
  {
    id: "prod-004",
    name: "Citerne Propane 500L",
    code: "CIT500",
    defaultUnit: "units",
    availableUnits: ["units", "liters"],
    weightPerUnit: 200.0,
    volumePerUnit: 0.8,
  },
  {
    id: "prod-005",
    name: "Accessoires (Détendeurs)",
    code: "ACC-DET",
    defaultUnit: "units",
    availableUnits: ["units"],
    weightPerUnit: 0.5,
    volumePerUnit: 0.01,
  },
]

const mockUser = {
  id: "user-001",
  name: "Jean Dupont",
  role: "chauffeur",
}

export default function TruckLoadingPage() {
  // TOUS LES HOOKS DOIVENT ÊTRE DÉCLARÉS EN PREMIER
  const [loadingSession, setLoadingSession] = useState({
    id: "",
    truckId: "",
    depotId: "",
    chauffeurId: mockUser.id,
    loadingDate: new Date().toISOString().split("T")[0],
    status: "in-progress",
    products: [],
    totalWeight: 0,
    totalVolume: 0,
  })

  const [selectedTruck, setSelectedTruck] = useState(null)
  const [selectedDepot, setSelectedDepot] = useState(null)
  const [newProduct, setNewProduct] = useState({
    productTypeId: "",
    unit: "",
    quantity: 0,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showPreview, setShowPreview] = useState(false) // DÉPLACÉ ICI

  // Calculate totals when products change
  useEffect(() => {
    const totals = loadingSession.products.reduce(
      (acc, product) => {
        const productType = mockProductTypes.find((p) => p.id === product.productTypeId)
        if (productType) {
          const weight = (productType.weightPerUnit || 0) * product.quantity
          const volume = (productType.volumePerUnit || 0) * product.quantity
          acc.weight += weight
          acc.volume += volume
        }
        return acc
      },
      { weight: 0, volume: 0 },
    )

    setLoadingSession((prev) => ({
      ...prev,
      totalWeight: totals.weight,
      totalVolume: totals.volume,
    }))
  }, [loadingSession.products])

  // TOUTES LES FONCTIONS APRÈS LES HOOKS
  const handleTruckChange = (truckId) => {
    const truck = mockTrucks.find((t) => t.id === truckId)
    setSelectedTruck(truck || null)
    setLoadingSession((prev) => ({ ...prev, truckId }))
  }

  const handleDepotChange = (depotId) => {
    const depot = mockDepots.find((d) => d.id === depotId)
    setSelectedDepot(depot || null)
    setLoadingSession((prev) => ({ ...prev, depotId }))
  }

  const handleProductTypeChange = (productTypeId) => {
    const productType = mockProductTypes.find((p) => p.id === productTypeId)
    if (productType) {
      setNewProduct({
        productTypeId,
        productName: productType.name,
        unit: productType.defaultUnit,
        quantity: 0,
      })
    }
  }

  const addProduct = () => {
    if (!newProduct.productTypeId || !newProduct.quantity || newProduct.quantity <= 0) {
      setErrors(["Veuillez sélectionner un produit et saisir une quantité valide."])
      return
    }

    const productType = mockProductTypes.find((p) => p.id === newProduct.productTypeId)
    if (!productType) return

    const product = {
      id: `loaded-${Date.now()}`,
      productTypeId: newProduct.productTypeId,
      productName: productType.name,
      unit: newProduct.unit || productType.defaultUnit,
      quantity: newProduct.quantity,
      totalWeight: (productType.weightPerUnit || 0) * newProduct.quantity,
      totalVolume: (productType.volumePerUnit || 0) * newProduct.quantity,
      notes: newProduct.notes,
    }

    setLoadingSession((prev) => ({
      ...prev,
      products: [...prev.products, product],
    }))

    // Reset form
    setNewProduct({
      productTypeId: "",
      unit: "",
      quantity: 0,
    })
    setErrors([])
  }

  const removeProduct = (productId) => {
    setLoadingSession((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }))
  }

  const updateProductQuantity = (productId, quantity) => {
    setLoadingSession((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id === productId) {
          const productType = mockProductTypes.find((pt) => pt.id === p.productTypeId)
          return {
            ...p,
            quantity,
            totalWeight: (productType?.weightPerUnit || 0) * quantity,
            totalVolume: (productType?.volumePerUnit || 0) * quantity,
          }
        }
        return p
      }),
    }))
  }

  const validateLoading = () => {
    const validationErrors = []

    if (!loadingSession.truckId) {
      validationErrors.push("Veuillez sélectionner un camion.")
    }

    if (!loadingSession.depotId) {
      validationErrors.push("Veuillez sélectionner un dépôt.")
    }

    if (loadingSession.products.length === 0) {
      validationErrors.push("Veuillez ajouter au moins un produit.")
    }

    if (selectedTruck) {
      if (loadingSession.totalWeight > selectedTruck.capacity.weight) {
        validationErrors.push(
          `Le poids total (${loadingSession.totalWeight.toFixed(1)}kg) dépasse la capacité du camion (${selectedTruck.capacity.weight}kg).`,
        )
      }

      if (loadingSession.totalVolume > selectedTruck.capacity.volume) {
        validationErrors.push(
          `Le volume total (${loadingSession.totalVolume.toFixed(1)}m³) dépasse la capacité du camion (${selectedTruck.capacity.volume}m³).`,
        )
      }
    }

    return validationErrors
  }

  const handleSaveLoading = async () => {
    const validationErrors = validateLoading()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setLoadingSession((prev) => ({
        ...prev,
        status: "completed",
        completedAt: new Date().toISOString(),
      }))

      setShowConfirmation(true)
      setErrors([])
    } catch (error) {
      setErrors(["Erreur lors de la sauvegarde. Veuillez réessayer."])
    } finally {
      setLoading(false)
    }
  }

  const getCapacityUsageColor = (used, capacity) => {
    const percentage = (used / capacity) * 100
    if (percentage > 90) return "tl-text-red"
    if (percentage > 75) return "tl-text-orange"
    return "tl-text-green"
  }

  const handlePreviewList = () => {
    setShowPreview(true)
  }

  const closePreview = () => {
    setShowPreview(false)
  }

  // CONDITIONS DE RETOUR APRÈS TOUS LES HOOKS
  if (showConfirmation) {
    return (
      <div className="tl-layout">
        <div className="tl-wrapper">
          <div className="tl-confirmation-container">
            <div className="tl-confirmation-card">
              <div className="tl-confirmation-content">
                <div className="tl-confirmation-icon">
                  <CheckCircle className="tl-icon-large tl-text-green" />
                </div>
                <h3 className="tl-confirmation-title">Chargement Confirmé</h3>
                <p className="tl-confirmation-message">
                  Le chargement du camion {selectedTruck?.plateNumber} a été enregistré avec succès.
                </p>
                <div className="tl-confirmation-actions">
                  <button className="tl-btn tl-btn-primary">Voir ma tournée</button>
                  <button 
                    className="tl-btn tl-btn-secondary" 
                    onClick={() => setShowConfirmation(false)}
                  >
                    Nouveau chargement
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
      <div className="tl-layout">
        <div className="tl-wrapper">
          <div className="tl-preview-overlay">
            <div className="tl-preview-modal">
              <div className="tl-preview-header">
                <h2 className="tl-preview-title">Aperçu du Chargement</h2>
                <button onClick={closePreview} className="tl-preview-close">
                  ×
                </button>
              </div>
              
              <div className="tl-preview-content">
                <div className="tl-preview-section">
                  <h3 className="tl-preview-section-title">Informations Générales</h3>
                  <div className="tl-preview-info">
                    <p><strong>Camion:</strong> {selectedTruck?.plateNumber} - {selectedTruck?.model}</p>
                    <p><strong>Dépôt:</strong> {selectedDepot?.name} ({selectedDepot?.code})</p>
                    <p><strong>Date:</strong> {loadingSession.loadingDate}</p>
                  </div>
                </div>

                <div className="tl-preview-section">
                  <h3 className="tl-preview-section-title">Produits Chargés ({loadingSession.products.length})</h3>
                  {loadingSession.products.length > 0 ? (
                    <ul className="tl-preview-products">
                      {loadingSession.products.map((product) => (
                        <li key={product.id} className="tl-preview-product-item">
                          <div className="tl-preview-product-main">
                            <strong>{product.productName}</strong> - {product.quantity} {product.unit}
                          </div>
                          <div className="tl-preview-product-details">
                            Poids: {product.totalWeight?.toFixed(1)}kg, Volume: {product.totalVolume?.toFixed(2)}m³
                          </div>
                          {product.notes && (
                            <div className="tl-preview-product-notes">
                              Notes: {product.notes}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="tl-preview-empty">Aucun produit chargé</p>
                  )}
                </div>
                {selectedTruck && (
                  <div className="tl-preview-section">
                    <h3 className="tl-preview-section-title">Résumé des Capacités</h3>
                    <div className="tl-preview-capacity">
                      <p>
                        <strong>Poids total:</strong> {loadingSession.totalWeight.toFixed(1)}kg / {selectedTruck.capacity.weight}kg
                        <span className={`tl-preview-status ${getCapacityUsageColor(loadingSession.totalWeight, selectedTruck.capacity.weight)}`}>
                          ({((loadingSession.totalWeight / selectedTruck.capacity.weight) * 100).toFixed(1)}%)
                        </span>
                      </p>
                      <p>
                        <strong>Volume total:</strong> {loadingSession.totalVolume.toFixed(1)}m³ / {selectedTruck.capacity.volume}m³
                        <span className={`tl-preview-status ${getCapacityUsageColor(loadingSession.totalVolume, selectedTruck.capacity.volume)}`}>
                          ({((loadingSession.totalVolume / selectedTruck.capacity.volume) * 100).toFixed(1)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="tl-preview-section">
                  <h3 className="tl-preview-section-title">Notes Générales</h3>
                  <p className="tl-preview-notes">
                    {loadingSession.notes || "Aucune note."}
                  </p>
                </div>
              </div>

              <div className="tl-preview-actions">
                <button onClick={closePreview} className="tl-btn tl-btn-secondary">
                  Fermer l'Aperçu
                </button>
                <button 
                  onClick={() => {
                    closePreview();
                    handleSaveLoading();
                  }}
                  disabled={loading || loadingSession.products.length === 0}
                  className="tl-btn tl-btn-primary"
                >
                  Confirmer le Chargement
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
    <div className="tl-layout">
      
      <div className="tl-wrapper">
        <div className="tl-container">
          <div className="tl-content">
            {/* Header */}
            <div className="tl-header">
              <div className="tl-header-left">
                <div className="tl-title-section">
                  <Package className="tl-title-icon" />
                  <h1 className="tl-title">Chargement Camion</h1>
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="tl-alert tl-alert-error">
                <AlertTriangle className="tl-alert-icon" />
                <div className="tl-alert-content">
                  <ul className="tl-error-list">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="tl-grid">
              {/* Left Column - Truck and Depot Selection */}
              <div className="tl-left-column">
                {/* Truck Selection */}
                <div className="tl-card">
                  <div className="tl-card-header">
                    <h3 className="tl-card-title">
                      <TruckIcon className="tl-card-icon" />
                      Sélection du Camion
                    </h3>
                  </div>
                  <div className="tl-card-content">
                    <div className="tl-form-group">
                      <label htmlFor="truck-select" className="tl-label">Camion</label>
                      <select 
                        value={loadingSession.truckId} 
                        onChange={(e) => handleTruckChange(e.target.value)}
                        className="tl-select"
                      >
                        <option value="">Sélectionner un camion</option>
                        {mockTrucks.map((truck) => (
                          <option key={truck.id} value={truck.id}>
                            {truck.plateNumber} - {truck.model}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedTruck && (
                      <div className="tl-truck-info">
                        <h4 className="tl-info-title">Capacités du camion</h4>
                        <div className="tl-capacity-details">
                          <div className="tl-capacity-item">
                            <span>Poids max:</span>
                            <span className="tl-capacity-value">{selectedTruck.capacity.weight}kg</span>
                          </div>
                          <div className="tl-capacity-item">
                            <span>Volume max:</span>
                            <span className="tl-capacity-value">{selectedTruck.capacity.volume}m³</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Depot Selection */}
                <div className="tl-card">
                  <div className="tl-card-header">
                    <h3 className="tl-card-title">
                      <MapPin className="tl-card-icon" />
                      Dépôt de Départ
                    </h3>
                  </div>
                  <div className="tl-card-content">
                    <div className="tl-form-group">
                      <label htmlFor="depot-select" className="tl-label">Dépôt</label>
                      <select 
                        value={loadingSession.depotId} 
                        onChange={(e) => handleDepotChange(e.target.value)}
                        className="tl-select"
                      >
                        <option value="">Sélectionner un dépôt</option>
                        {mockDepots.map((depot) => (
                          <option key={depot.id} value={depot.id}>
                            {depot.name} ({depot.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedDepot && (
                      <div className="tl-depot-info">
                        <h4 className="tl-info-title">{selectedDepot.name}</h4>
                        <p className="tl-depot-address">{selectedDepot.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Loading Summary */}
                {selectedTruck && loadingSession.products.length > 0 && (
                  <div className="tl-card">
                    <div className="tl-card-header">
                      <h3 className="tl-card-title">
                        <ClipboardList className="tl-card-icon" />
                        Résumé du Chargement
                      </h3>
                    </div>
                    <div className="tl-card-content">
                      <div className="tl-summary-section">
                        <div className="tl-summary-item">
                          <div className="tl-summary-header">
                            <span className="tl-summary-label">Poids total:</span>
                            <span className={`tl-summary-value ${getCapacityUsageColor(loadingSession.totalWeight, selectedTruck.capacity.weight)}`}>
                              {loadingSession.totalWeight.toFixed(1)}kg / {selectedTruck.capacity.weight}kg
                            </span>
                          </div>
                          <div className="tl-progress-bar">
                            <div 
                              className={`tl-progress-fill ${
                                loadingSession.totalWeight > selectedTruck.capacity.weight
                                  ? "tl-progress-red"
                                  : loadingSession.totalWeight > selectedTruck.capacity.weight * 0.75
                                    ? "tl-progress-orange"
                                    : "tl-progress-green"
                              }`}
                              style={{
                                width: `${Math.min((loadingSession.totalWeight / selectedTruck.capacity.weight) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="tl-summary-item">
                          <div className="tl-summary-header">
                            <span className="tl-summary-label">Volume total:</span>
                            <span className={`tl-summary-value ${getCapacityUsageColor(loadingSession.totalVolume, selectedTruck.capacity.volume)}`}>
                              {loadingSession.totalVolume.toFixed(1)}m³ / {selectedTruck.capacity.volume}m³
                            </span>
                          </div>
                          <div className="tl-progress-bar">
                            <div 
                              className={`tl-progress-fill ${
                                loadingSession.totalVolume > selectedTruck.capacity.volume
                                  ? "tl-progress-red"
                                  : loadingSession.totalVolume > selectedTruck.capacity.volume * 0.75
                                    ? "tl-progress-orange"
                                    : "tl-progress-green"
                              }`}
                              style={{
                                width: `${Math.min((loadingSession.totalVolume / selectedTruck.capacity.volume) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="tl-summary-total">
                          <div className="tl-summary-header">
                            <span className="tl-summary-label">Nombre d'articles:</span>
                            <span className="tl-summary-value">{loadingSession.products.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Product Management */}
              <div className="tl-right-column">
                {/* Add Product */}
                <div className="tl-card">
                  <div className="tl-card-header">
                    <h3 className="tl-card-title">
                      <Plus className="tl-card-icon" />
                      Ajouter un Produit
                    </h3>
                  </div>
                  <div className="tl-card-content">
                    <div className="tl-product-form">
                      <div className="tl-form-row">
                        <div className="tl-form-group">
                          <label htmlFor="product-type" className="tl-label">Produit</label>
                          <select 
                            value={newProduct.productTypeId || ""} 
                            onChange={(e) => handleProductTypeChange(e.target.value)}
                            className="tl-select"
                          >
                            <option value="">Sélectionner</option>
                            {mockProductTypes.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.code})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="tl-form-group">
                          <label htmlFor="unit" className="tl-label">Unité</label>
                          <select
                            value={newProduct.unit || ""}
                            onChange={(e) => setNewProduct((prev) => ({ ...prev, unit: e.target.value }))}
                            disabled={!newProduct.productTypeId}
                            className="tl-select"
                          >
                            <option value="">Unité</option>
                            {newProduct.productTypeId &&
                              mockProductTypes
                                .find((p) => p.id === newProduct.productTypeId)
                                ?.availableUnits.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                          </select>
                        </div>

                        <div className="tl-form-group">
                          <label htmlFor="quantity" className="tl-label">Quantité</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={newProduct.quantity || ""}
                            onChange={(e) =>
                              setNewProduct((prev) => ({
                                ...prev,
                                quantity: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder="0"
                            className="tl-input"
                          />
                        </div>

                        <div className="tl-form-group tl-add-btn-group">
                          <button
                            onClick={addProduct}
                            disabled={!newProduct.productTypeId || !newProduct.quantity}
                            className="tl-btn tl-btn-primary tl-add-btn"
                          >
                            <Plus className="tl-btn-icon" />
                            Ajouter
                          </button>
                        </div>
                      </div>

                      <div className="tl-form-group">
                        <label htmlFor="notes" className="tl-label">Notes (optionnel)</label>
                        <textarea
                          value={newProduct.notes || ""}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder="Notes sur ce produit..."
                          rows={2}
                          className="tl-textarea"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product List */}
                <div className="tl-card">
                  <div className="tl-card-header">
                    <div className="tl-card-title-with-badge">
                      <h3 className="tl-card-title">
                        <Package className="tl-card-icon" />
                        Produits Chargés
                      </h3>
                      <span className="tl-badge">
                        {loadingSession.products.length} article{loadingSession.products.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="tl-card-content">
                    {loadingSession.products.length === 0 ? (
                      <div className="tl-empty-state">
                        <Package className="tl-empty-icon" />
                        <h3 className="tl-empty-title">Aucun produit chargé</h3>
                        <p className="tl-empty-message">Commencez par ajouter des produits à votre chargement.</p>
                      </div>
                    ) : (
                      <div className="tl-products-list">
                        {loadingSession.products.map((product) => {
                          const productType = mockProductTypes.find((p) => p.id === product.productTypeId)
                          return (
                            <div key={product.id} className="tl-product-item">
                              <div className="tl-product-header">
                                <h4 className="tl-product-name">{product.productName}</h4>
                                <p className="tl-product-code">Code: {productType?.code}</p>
                              </div>

                              <div className="tl-product-details">
                                <div className="tl-product-detail">
                                  <span className="tl-detail-label">Quantité:</span>
                                  <div className="tl-quantity-input">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      value={product.quantity}
                                      onChange={(e) =>
                                        updateProductQuantity(product.id, Number.parseFloat(e.target.value) || 0)
                                      }
                                      className="tl-input tl-input-small"
                                    />
                                    <span className="tl-unit">{product.unit}</span>
                                  </div>
                                </div>

                                <div className="tl-product-detail">
                                  <span className="tl-detail-label">Poids:</span>
                                  <p className="tl-detail-value">{product.totalWeight?.toFixed(1)}kg</p>
                                </div>

                                <div className="tl-product-detail">
                                  <span className="tl-detail-label">Volume:</span>
                                  <p className="tl-detail-value">{product.totalVolume?.toFixed(2)}m³</p>
                                </div>

                                <div className="tl-product-actions">
                                  <button
                                    onClick={() => removeProduct(product.id)}
                                    className="tl-btn tl-btn-danger tl-btn-small"
                                  >
                                    <Trash2 className="tl-btn-icon" />
                                  </button>
                                </div>
                              </div>

                              {product.notes && (
                                <div className="tl-product-notes">
                                  <span className="tl-notes-label">Notes:</span>
                                  <p className="tl-notes-text">{product.notes}</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes and Confirmation */}
                <div className="tl-card">
                  <div className="tl-card-header">
                    <h3 className="tl-card-title">Notes Générales</h3>
                  </div>
                  <div className="tl-card-content">
                    <div className="tl-form-group">
                      <label htmlFor="general-notes" className="tl-label">Notes sur le chargement</label>
                      <textarea
                        value={loadingSession.notes || ""}
                        onChange={(e) => setLoadingSession((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notes générales sur le chargement, observations, etc..."
                        rows={3}
                        className="tl-textarea"
                      />
                    </div>

                    <div className="tl-action-buttons">
                      <button
                        onClick={handleSaveLoading}
                        disabled={loading || loadingSession.products.length === 0}
                        className="tl-btn tl-btn-primary tl-btn-large"
                      >
                        {loading ? (
                          <>
                            <div className="tl-spinner" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="tl-btn-icon" />
                            Confirmer le Chargement
                          </>
                        )}
                      </button>

                      <button   
                        onClick={handlePreviewList}  
                        className="tl-btn tl-btn-secondary tl-btn-large"  
                      >  
                        <ClipboardList className="tl-btn-icon" />  
                        Aperçu Liste  
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