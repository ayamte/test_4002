import React, { useState, useEffect } from 'react'
import {
  MdDownload as Download,
  MdUpload as Upload,
  MdDescription as FileText,
  MdBusiness as Building2,
  MdInventory as Package,
  MdCalendarToday as Calendar,
  MdWarning as AlertTriangle,
  MdCheckCircle as CheckCircle,
  MdHistory as History,
  MdAdd as Plus,
  MdClose as X,
  MdVisibility as Eye,
  MdLocalShipping as TruckIcon,
} from 'react-icons/md'
import './SupplierVoucher.css'

// Mock data
const mockSuppliers = [
  {
    id: "sup-001",
    name: "GazPro Distribution",
    companyName: "GazPro Distribution SARL",
    email: "commandes@gazpro.fr",
    phone: "01 23 45 67 89",
    address: "45 Rue de l'Industrie, 93200 Saint-Denis",
    taxNumber: "FR12345678901",
    paymentTerms: "30 jours",
    isActive: true,
  },
  {
    id: "sup-002",
    name: "Butane & Propane Services",
    companyName: "BP Services SA",
    email: "contact@bpservices.fr",
    phone: "01 34 56 78 90",
    address: "123 Avenue des Gaz, 75015 Paris",
    taxNumber: "FR23456789012",
    paymentTerms: "45 jours",
    isActive: true,
  },
  {
    id: "sup-003",
    name: "EnerGaz Solutions",
    companyName: "EnerGaz Solutions EURL",
    email: "orders@energaz.fr",
    phone: "01 45 67 89 01",
    address: "78 Boulevard Industriel, 94200 Ivry-sur-Seine",
    taxNumber: "FR34567890123",
    paymentTerms: "60 jours",
    isActive: true,
  },
]

const bottleTypes = [
  "Bouteille Gaz Butane 6kg",
  "Bouteille Gaz Butane 13kg",
  "Bouteille Gaz Propane 13kg",
  "Bouteille Gaz Propane 35kg",
  "Citerne Propane 500L",
  "Citerne Propane 1000L",
  "Détendeur Butane",
  "Détendeur Propane",
  "Tuyau Gaz 1.5m",
  "Tuyau Gaz 3m",
]

const mockUser = {
  id: "user-001",
  name: "Admin System",
  role: "admin",
}

export default function SupplierVoucherPage() {
  // TOUS LES HOOKS EN PREMIER
  const [selectedSupplierId, setSelectedSupplierId] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0])
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({
    bottleType: "",
    quantity: 0,
    unitPrice: 0,
  })
  const [generalNotes, setGeneralNotes] = useState("")
  const [uploadedImage, setUploadedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [generatedVoucher, setGeneratedVoucher] = useState(null)

  const TAX_RATE = 0.2 // 20% TVA

  // Update selected supplier when ID changes
  useEffect(() => {
    if (selectedSupplierId) {
      const supplier = mockSuppliers.find((s) => s.id === selectedSupplierId)
      setSelectedSupplier(supplier || null)
    } else {
      setSelectedSupplier(null)
    }
  }, [selectedSupplierId])

  // TOUTES LES FONCTIONS
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxAmount = subtotal * TAX_RATE
  const totalAmount = subtotal + taxAmount

  const addItem = () => {
    if (!newItem.bottleType || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      setErrors(["Veuillez remplir tous les champs de l'article."])
      return
    }

    const item = {
      id: `item-${Date.now()}`,
      bottleType: newItem.bottleType,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      totalPrice: newItem.quantity * newItem.unitPrice,
    }

    setItems((prev) => [...prev, item])
    setNewItem({ bottleType: "", quantity: 0, unitPrice: 0 })
    setErrors([])
  }

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const updateItemQuantity = (itemId, quantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              totalPrice: quantity * item.unitPrice,
            }
          : item,
      ),
    )
  }

  const updateItemPrice = (itemId, unitPrice) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              unitPrice,
              totalPrice: item.quantity * unitPrice,
            }
          : item,
      ),
    )
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(["L'image ne doit pas dépasser 5MB."])
        return
      }
      setUploadedImage(file)
      setErrors([])
    }
  }

  const validateForm = () => {
    const validationErrors = []

    if (!selectedSupplierId) {
      validationErrors.push("Veuillez sélectionner un fournisseur.")
    }

    if (!orderDate) {
      validationErrors.push("Veuillez sélectionner une date de commande.")
    }

    if (items.length === 0) {
      validationErrors.push("Veuillez ajouter au moins un article à la commande.")
    }

    return validationErrors
  }

  const handleDownloadVoucher = async () => {
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const voucher = {
        id: `voucher-${Date.now()}`,
        voucherNumber: `BC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        supplierId: selectedSupplierId,
        orderDate,
        items,
        subtotal,
        taxRate: TAX_RATE,
        taxAmount,
        totalAmount,
        generalNotes,
        imageUrl: uploadedImage ? URL.createObjectURL(uploadedImage) : undefined,
        status: "draft",
        createdBy: mockUser.id,
        createdAt: new Date().toISOString(),
      }

      setGeneratedVoucher(voucher)
      setShowConfirmation(true)
      setErrors([])

      console.log("Downloading voucher:", voucher.voucherNumber)
    } catch (error) {
      setErrors(["Erreur lors de la génération du bon de commande. Veuillez réessayer."])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedSupplierId("")
    setSelectedSupplier(null)
    setOrderDate(new Date().toISOString().split("T")[0])
    setItems([])
    setNewItem({ bottleType: "", quantity: 0, unitPrice: 0 })
    setGeneralNotes("")
    setUploadedImage(null)
    setErrors([])
    setShowConfirmation(false)
    setGeneratedVoucher(null)
  }

  // CONDITIONS DE RETOUR APRÈS TOUS LES HOOKS
  if (showConfirmation && generatedVoucher) {
    return (
      <div className="sv-layout">
        <div className="sv-wrapper">
          <div className="sv-confirmation-container">
            <div className="sv-confirmation-card">
              <div className="sv-confirmation-content">
                <div className="sv-confirmation-icon">
                  <CheckCircle className="sv-icon-large sv-text-green" />
                </div>
                <h3 className="sv-confirmation-title">Bon de Commande Généré</h3>
                <p className="sv-confirmation-message">
                  Le bon de commande <strong>{generatedVoucher.voucherNumber}</strong> a été généré avec succès.
                </p>

                <div className="sv-confirmation-summary">
                  <div className="sv-summary-grid">
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">Fournisseur:</span>
                      <p className="sv-summary-value">{selectedSupplier?.name}</p>
                    </div>
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">Date:</span>
                      <p className="sv-summary-value">{orderDate}</p>
                    </div>
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">Articles:</span>
                      <p className="sv-summary-value">{items.length}</p>
                    </div>
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">Total TTC:</span>
                      <p className="sv-summary-value">{totalAmount.toFixed(2)}€</p>
                    </div>
                  </div>
                </div>

                <div className="sv-confirmation-actions">
                  <button className="sv-btn sv-btn-primary sv-btn-large">
                    <Download className="sv-btn-icon" />
                    Télécharger le PDF
                  </button>
                  <button className="sv-btn sv-btn-secondary">
                    <Eye className="sv-btn-icon" />
                    Aperçu du Bon
                  </button>
                  <button onClick={resetForm} className="sv-btn sv-btn-secondary">
                    <Plus className="sv-btn-icon" />
                    Nouveau Bon de Commande
                  </button>
                  <button className="sv-btn sv-btn-secondary">
                    <History className="sv-btn-icon" />
                    Voir l'Historique
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
    <div className="sv-layout">
      
      <div className="sv-wrapper">
        <div className="sv-container">
          <div className="sv-content">
            {/* Header */}
            <div className="sv-header">
              <div className="sv-header-left">
                <h2 className="sv-title">Bon de Commande Fournisseur</h2>
                <p className="sv-subtitle">Créez et téléchargez un bon de commande pour vos fournisseurs</p>
              </div>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="sv-alert sv-alert-error">
                <AlertTriangle className="sv-alert-icon" />
                <div className="sv-alert-content">
                  <ul className="sv-error-list">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="sv-main-grid">
              {/* Left Column - Supplier and Order Info */}
              <div className="sv-left-column">
                {/* Supplier Selection */}
                <div className="sv-card">
                  <div className="sv-card-header">
                    <h3 className="sv-card-title">
                      <Building2 className="sv-card-icon" />
                      Sélection du Fournisseur
                    </h3>
                  </div>
                  <div className="sv-card-content">
                    <div className="sv-form-group">
                      <label htmlFor="supplier-select" className="sv-label">Fournisseur *</label>
                      <select
                        id="supplier-select"
                        value={selectedSupplierId}
                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                        className="sv-select"
                      >
                        <option value="">Choisir un fournisseur</option>
                        {mockSuppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedSupplier && (
                      <div className="sv-supplier-info">
                        <h4 className="sv-supplier-info-title">Informations Fournisseur</h4>
                        <div className="sv-supplier-details">
                          <div className="sv-detail-item">
                            <span className="sv-detail-label">Société:</span>
                            <p className="sv-detail-value">{selectedSupplier.companyName}</p>
                          </div>
                          <div className="sv-detail-item">
                            <span className="sv-detail-label">Email:</span>
                            <p className="sv-detail-value">{selectedSupplier.email}</p>
                          </div>
                          <div className="sv-detail-item">
                            <span className="sv-detail-label">Téléphone:</span>
Je vais continuer le code JSX pour SupplierVoucher là où il s'est arrêté dans la section des détails du fournisseur.

## Suite du JSX - SupplierVoucher.jsx (continuation)

```jsx
                            <p className="sv-detail-value">{selectedSupplier.phone}</p>
                          </div>
                          <div className="sv-detail-item">
                            <span className="sv-detail-label">Conditions:</span>
                            <p className="sv-detail-value">{selectedSupplier.paymentTerms}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Date */}
                <div className="sv-card">
                  <div className="sv-card-header">
                    <h3 className="sv-card-title">
                      <Calendar className="sv-card-icon" />
                      Date de Commande
                    </h3>
                  </div>
                  <div className="sv-card-content">
                    <div className="sv-form-group">
                      <label htmlFor="order-date" className="sv-label">Date *</label>
                      <input
                        id="order-date"
                        type="date"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        className="sv-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="sv-card">
                  <div className="sv-card-header">
                    <h3 className="sv-card-title">
                      <Upload className="sv-card-icon" />
                      Image du Bon
                    </h3>
                  </div>
                  <div className="sv-card-content">
                    <div className="sv-form-group">
                      <label htmlFor="image-upload" className="sv-label">Télécharger une Image (facultatif)</label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sv-file-input"
                      />
                      {uploadedImage && (
                        <div className="sv-upload-success">
                          <p className="sv-upload-text">Image sélectionnée: {uploadedImage.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                {items.length > 0 && (
                  <div className="sv-card">
                    <div className="sv-card-header">
                      <h3 className="sv-card-title">Résumé de la Commande</h3>
                    </div>
                    <div className="sv-card-content">
                      <div className="sv-summary-section">
                        <div className="sv-summary-item">
                          <span className="sv-summary-label">Sous-total HT:</span>
                          <span className="sv-summary-value">{subtotal.toFixed(2)}€</span>
                        </div>
                        <div className="sv-summary-item">
                          <span className="sv-summary-label">TVA (20%):</span>
                          <span className="sv-summary-value">{taxAmount.toFixed(2)}€</span>
                        </div>
                        <div className="sv-separator" />
                        <div className="sv-summary-item sv-summary-total">
                          <span className="sv-summary-label">Total TTC:</span>
                          <span className="sv-summary-value">{totalAmount.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Items and Notes */}
              <div className="sv-right-column">
                {/* Add Item */}
                <div className="sv-card">
                  <div className="sv-card-header">
                    <h3 className="sv-card-title">
                      <Plus className="sv-card-icon" />
                      Ajouter un Article
                    </h3>
                  </div>
                  <div className="sv-card-content">
                    <div className="sv-add-item-grid">
                      <div className="sv-form-group sv-form-group-span-2">
                        <label htmlFor="bottle-type" className="sv-label">Type de Bouteille *</label>
                        <select
                          id="bottle-type"
                          value={newItem.bottleType}
                          onChange={(e) => setNewItem((prev) => ({ ...prev, bottleType: e.target.value }))}
                          className="sv-select"
                        >
                          <option value="">Sélectionner</option>
                          {bottleTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sv-form-group">
                        <label htmlFor="quantity" className="sv-label">Quantité *</label>
                        <input
                          id="quantity"
                          type="number"
                          min="1"
                          value={newItem.quantity || ""}
                          onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                          className="sv-input"
                        />
                      </div>

                      <div className="sv-form-group">
                        <label htmlFor="unit-price" className="sv-label">Prix Unitaire (MAD) *</label>
                        <input
                          id="unit-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newItem.unitPrice || ""}
                          onChange={(e) => setNewItem((prev) => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                          className="sv-input"
                        />
                      </div>
                    </div>

                    <div className="sv-add-item-actions">
                      <button
                        onClick={addItem}
                        disabled={!newItem.bottleType || newItem.quantity <= 0 || newItem.unitPrice <= 0}
                        className="sv-btn sv-btn-primary"
                      >
                        <Plus className="sv-btn-icon" />
                        Ajouter l'Article
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="sv-card">
                  <div className="sv-card-header">
                    <div className="sv-card-header-with-badge">
                      <h3 className="sv-card-title">
                        <Package className="sv-card-icon" />
                        Articles de la Commande
                      </h3>
                      <div className="sv-badge">
                        {items.length} article{items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="sv-card-content">
                    {items.length === 0 ? (
                      <div className="sv-empty-state">
                        <Package className="sv-empty-icon" />
                        <h3 className="sv-empty-title">Aucun article ajouté</h3>
                        <p className="sv-empty-message">Commencez par ajouter des articles à votre commande.</p>
                      </div>
                    ) : (
                      <div className="sv-items-list">
                        {items.map((item) => (
                          <div key={item.id} className="sv-item-card">
                            <div className="sv-item-header">
                              <div className="sv-item-info">
                                <h4 className="sv-item-name">{item.bottleType}</h4>
                                <div className="sv-item-details-grid">
                                  <div className="sv-item-detail">
                                    <label className="sv-item-detail-label">Quantité</label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                                      className="sv-item-input"
                                    />
                                  </div>
                                  <div className="sv-item-detail">
                                    <label className="sv-item-detail-label">Prix Unitaire (€)</label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.unitPrice}
                                      onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                      className="sv-item-input"
                                    />
                                  </div>
                                  <div className="sv-item-detail">
                                    <label className="sv-item-detail-label">Total (€)</label>
                                    <p className="sv-item-total">{item.totalPrice.toFixed(2)}€</p>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="sv-btn sv-btn-remove"
                              >
                                <X className="sv-btn-icon" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* General Notes and Download */}
                <div className="sv-card">
                  <div className="sv-card-header">
                    <h3 className="sv-card-title">Notes et Téléchargement</h3>
                  </div>
                  <div className="sv-card-content">
                    <div className="sv-form-group">
                      <label htmlFor="general-notes" className="sv-label">Notes Générales (facultatif)</label>
                      <textarea
                        id="general-notes"
                        value={generalNotes}
                        onChange={(e) => setGeneralNotes(e.target.value)}
                        placeholder="Ajoutez des notes ou commentaires sur cette commande..."
                        rows={4}
                        className="sv-textarea"
                      />
                    </div>

                    <div className="sv-separator" />

                    <div className="sv-download-actions">
                      <button
                        onClick={handleDownloadVoucher}
                        disabled={loading || items.length === 0 || !selectedSupplierId}
                        className="sv-btn sv-btn-primary sv-btn-large"
                      >
                        {loading ? (
                          <>
                            <div className="sv-spinner" />
                            Génération...
                          </>
                        ) : (
                          <>
                            <Download className="sv-btn-icon" />
                            Télécharger le Bon
                          </>
                        )}
                      </button>

                      <button onClick={resetForm} className="sv-btn sv-btn-secondary sv-btn-large">
                        <FileText className="sv-btn-icon" />
                        Nouveau Bon
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