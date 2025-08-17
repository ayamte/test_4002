import { useState } from "react"  
import {   
  MdSearch as Search,   
  MdAdd as Plus,   
  MdEdit as Edit,  
  MdDelete as Delete,  
  MdClose as X,  
  MdAttachFile as AttachFile  
} from "react-icons/md"  
import "./gestionBon.css"  
  
// Données d'exemple pour les bons des fournisseurs  
const supplierVouchersData = [  
  {  
    id: 1,  
    date: "2024-01-15",  
    camion: "AB-123-CD",  
    chauffeur: "Jean Dupont",  
    typeProduit: "Butane",  
    quantite: 500,  
    prixUnitaire: 12.50,  
    montantTotal: 6250.00,  
    bonUrl: "/documents/bon-001.pdf"  
  },  
  {  
    id: 2,  
    date: "2024-01-16",  
    camion: "EF-456-GH",  
    chauffeur: "Ahmed Benali",  
    typeProduit: "Propane",  
    quantite: 750,  
    prixUnitaire: 11.80,  
    montantTotal: 8850.00,  
    bonUrl: "/documents/bon-002.pdf"  
  },  
  {  
    id: 3,  
    date: "2024-01-17",  
    camion: "IJ-789-KL",  
    chauffeur: "Mohamed Alami",  
    typeProduit: "Butane",  
    quantite: 300,  
    prixUnitaire: 12.50,  
    montantTotal: 3750.00,  
    bonUrl: "/documents/bon-003.pdf"  
  },  
  {  
    id: 4,  
    date: "2024-01-18",  
    camion: "MN-012-OP",  
    chauffeur: "Fatima Zahra",  
    typeProduit: "Propane",  
    quantite: 600,  
    prixUnitaire: 11.80,  
    montantTotal: 7080.00,  
    bonUrl: "/documents/bon-004.pdf"  
  },  
]  
  
export default function SupplierVoucherManagement() {  
  const [searchTerm, setSearchTerm] = useState("")  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)  
  const [supplierVouchers, setSupplierVouchers] = useState(supplierVouchersData)  
  const [editingVoucher, setEditingVoucher] = useState(null)  
  const [formData, setFormData] = useState({  
    date: "",  
    camion: "",  
    chauffeur: "",  
    typeProduit: "",  
    quantite: "",  
    prixUnitaire: "",  
    bonFile: null  
  })  
  
  // Filtrer les bons selon le terme de recherche  
  const filteredVouchers = supplierVouchers.filter(  
    (voucher) =>  
      voucher.camion.toLowerCase().includes(searchTerm.toLowerCase()) ||  
      voucher.chauffeur.toLowerCase().includes(searchTerm.toLowerCase()) ||  
      voucher.typeProduit.toLowerCase().includes(searchTerm.toLowerCase()) ||  
      voucher.date.includes(searchTerm)  
  )  
  
  const handleInputChange = (field, value) => {  
    setFormData((prev) => ({  
      ...prev,  
      [field]: value,  
    }))  
  }  
  
  const handleFileChange = (e) => {  
    const file = e.target.files[0]  
    setFormData((prev) => ({  
      ...prev,  
      bonFile: file  
    }))  
  }  
  
  const calculateTotal = () => {  
    const quantite = parseFloat(formData.quantite) || 0  
    const prixUnitaire = parseFloat(formData.prixUnitaire) || 0  
    return quantite * prixUnitaire  
  }  
  
  const handleAddSubmit = (e) => {  
    e.preventDefault()  
    const montantTotal = calculateTotal()  
    const newVoucher = {  
      id: supplierVouchers.length + 1,  
      date: formData.date,  
      camion: formData.camion,  
      chauffeur: formData.chauffeur,  
      typeProduit: formData.typeProduit,  
      quantite: parseFloat(formData.quantite),  
      prixUnitaire: parseFloat(formData.prixUnitaire),  
      montantTotal: montantTotal,  
      bonUrl: formData.bonFile ? `/documents/bon-${supplierVouchers.length + 1}.pdf` : null  
    }  
    setSupplierVouchers([...supplierVouchers, newVoucher])  
    console.log("Nouveau bon:", newVoucher)  
  
    // Réinitialiser le formulaire et fermer le modal  
    setFormData({  
      date: "",  
      camion: "",  
      chauffeur: "",  
      typeProduit: "",  
      quantite: "",  
      prixUnitaire: "",  
      bonFile: null  
    })  
    setIsAddDialogOpen(false)  
  }  
  
  const handleEditSubmit = (e) => {  
    e.preventDefault()  
    const montantTotal = calculateTotal()  
    const updatedVouchers = supplierVouchers.map(voucher =>   
      voucher.id === editingVoucher.id ? {  
        ...editingVoucher,  
        date: formData.date,  
        camion: formData.camion,  
        chauffeur: formData.chauffeur,  
        typeProduit: formData.typeProduit,  
        quantite: parseFloat(formData.quantite),  
        prixUnitaire: parseFloat(formData.prixUnitaire),  
        montantTotal: montantTotal,  
        bonUrl: formData.bonFile ? `/documents/bon-${editingVoucher.id}.pdf` : voucher.bonUrl  
      } : voucher  
    )  
    setSupplierVouchers(updatedVouchers)  
    console.log("Bon modifié:", { ...editingVoucher, ...formData })  
  
    // Réinitialiser et fermer  
    setFormData({  
      date: "",  
      camion: "",  
      chauffeur: "",  
      typeProduit: "",  
      quantite: "",  
      prixUnitaire: "",  
      bonFile: null  
    })  
    setEditingVoucher(null)  
    setIsEditDialogOpen(false)  
  }  
  
  const handleEdit = (voucher) => {  
    setEditingVoucher(voucher)  
    setFormData({  
      date: voucher.date,  
      camion: voucher.camion,  
      chauffeur: voucher.chauffeur,  
      typeProduit: voucher.typeProduit,  
      quantite: voucher.quantite.toString(),  
      prixUnitaire: voucher.prixUnitaire.toString(),  
      bonFile: null  
    })  
    setIsEditDialogOpen(true)  
  }  
  
  const handleDelete = (voucherId) => {  
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bon ?")) {  
      const updatedVouchers = supplierVouchers.filter(voucher => voucher.id !== voucherId)  
      setSupplierVouchers(updatedVouchers)  
      console.log("Bon supprimé:", voucherId)  
    }  
  }  
  
  const handleAddClick = () => {  
    // Réinitialiser complètement le formulaire pour l'ajout  
    setFormData({  
      date: "",  
      camion: "",  
      chauffeur: "",  
      typeProduit: "",  
      quantite: "",  
      prixUnitaire: "",  
      bonFile: null  
    })  
    setIsAddDialogOpen(true)  
  }  
  
  const handleViewBon = (bonUrl) => {  
    if (bonUrl) {  
      window.open(bonUrl, '_blank')  
    }  
  }  
  
  return (  
    <div className="supplier-management-layout">  
        
      <div className="supplier-management-wrapper">  
        <div className="supplier-management-container">  
          <div className="supplier-management-content">  
            {/* En-tête */}  
            <div className="supplier-page-header">  
              <h1 className="supplier-page-title">Gestion des Bons des Fournisseurs</h1>  
              <p className="supplier-page-subtitle">Gérez les bons de livraison des fournisseurs</p>  
            </div>  
  
            {/* Bouton Ajouter Bon */}  
            <div className="supplier-action-section">  
              <button className="supplier-add-button" onClick={handleAddClick}>  
                <Plus className="supplier-button-icon" />  
                Ajouter Bon  
              </button>  
            </div>  
  
            {/* Barre de recherche */}  
            <div className="supplier-search-section">  
              <div className="supplier-search-container">  
                <Search className="supplier-search-icon" />  
                <input  
                  type="text"  
                  placeholder="Rechercher par camion, chauffeur, produit ou date..."  
                  value={searchTerm}  
                  onChange={(e) => setSearchTerm(e.target.value)}  
                  className="supplier-search-input"  
                />  
              </div>  
            </div>  
  
            {/* Tableau */}  
            <div className="supplier-table-card">  
              <div className="supplier-table-header">  
                <h3 className="supplier-table-title">Liste des Bons des Fournisseurs</h3>  
              </div>  
              <div className="supplier-table-content">  
                <div className="supplier-table-container">  
                  <table className="supplier-vouchers-table">  
                    <thead>  
                      <tr>  
                        <th>Date</th>  
                        <th>Camion</th>  
                        <th>Chauffeur</th>  
                        <th>Type du produit</th>  
                        <th>Quantité</th>  
                        <th>Prix unitaire</th>  
                        <th>Montant total</th>  
                        <th>Bon</th>  
                        <th>Actions</th>  
                      </tr>  
                    </thead>  
                    <tbody>  
                      {filteredVouchers.map((voucher) => (  
                        <tr key={voucher.id}>  
                          <td>{new Date(voucher.date).toLocaleDateString('fr-FR')}</td>  
                          <td className="supplier-font-medium">{voucher.camion}</td>  
                          <td>{voucher.chauffeur}</td>  
                          <td>{voucher.typeProduit}</td>  
                          <td>{voucher.quantite} L</td>  
                          <td>{voucher.prixUnitaire.toFixed(2)} MAD</td>  
                          <td className="supplier-font-medium">{voucher.montantTotal.toFixed(2)} MAD</td>  
                          <td>  
                            {voucher.bonUrl ? (  
                              <button   
                                className="supplier-view-bon-button"  
                                onClick={() => handleViewBon(voucher.bonUrl)}  
                              >  
                                <AttachFile className="supplier-bon-icon" />  
                                Voir  
                              </button>  
                            ) : (  
                              <span className="supplier-no-bon">Aucun</span>  
                            )}  
                          </td>  
                          <td>  
                            <div className="supplier-action-buttons">  
                              <button   
                                className="supplier-edit-action-button"  
                                onClick={() => handleEdit(voucher)}  
                              >  
                                <Edit className="supplier-action-icon" />  
                              </button>  
                              <button   
                                className="supplier-delete-action-button"  
                                onClick={() => handleDelete(voucher.id)}  
                              >  
                                <Delete className="supplier-action-icon" />  
                              </button>  
                            </div>  
                          </td>  
                        </tr>  
                      ))}  
                    </tbody>  
                  </table>  
  
                  {filteredVouchers.length === 0 && (  
                    <div className="supplier-no-results">  
                      Aucun bon trouvé pour votre recherche.  
                    </div>  
                  )}  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
      </div>  
  
      {/* Modal pour ajouter un bon */}  
      {isAddDialogOpen && (  
        <div className="supplier-modal-overlay" onClick={() => setIsAddDialogOpen(false)}>  
          <div className="supplier-modal-content" onClick={(e) => e.stopPropagation()}>  
            <div className="supplier-modal-header">  
              <h2 className="supplier-modal-title">Ajouter Bon Fournisseur</h2>  
              <button className="supplier-modal-close" onClick={() => setIsAddDialogOpen(false)}>  
                <X className="supplier-close-icon" />  
              </button>  
            </div>  
              
            <form onSubmit={handleAddSubmit} className="supplier-modal-form">  
              <div className="supplier-form-row">  
                <div className="supplier-form-group">  
                  <label htmlFor="date" className="supplier-form-label">Date</label>  
                  <input  
                    id="date"  
                    type="date"  
                    value={formData.date}  
                    onChange={(e) => handleInputChange("date", e.target.value)}  
                    className="supplier-form-input"  
                    required  
                  />  
                </div>  
  
                <div className="supplier-form-group">  
                  <label htmlFor="camion" className="supplier-form-label">Camion</label>  
                  <input  
                    id="camion"  
                    type="text"  
                    placeholder="Ex: AB-123-CD"  
                    value={formData.camion}  
                    onChange={(e) => handleInputChange("camion", e.target.value)}  
                    className="supplier-form-input"  
                    required  
                  />  
                </div>  
              </div>  
  
              <div className="supplier-form-row">  
                <div className="supplier-form-group">  
                  <label htmlFor="chauffeur" className="supplier-form-label">Chauffeur</label>  
                  <input  
                    id="chauffeur"  
                    type="text"  
                    placeholder="Ex: Jean Dupont"  
                    value={formData.chauffeur}  
                    onChange={(e) => handleInputChange("chauffeur", e.target.value)}  
                    className="supplier-form-input"  
                    required  
                  />  
                </div>  
  
                <div className="supplier-form-group">  
                  <label htmlFor="typeProduit" className="supplier-form-label">Type du produit</label>  
                  <select  
                    id="typeProduit"  
                    value={formData.typeProduit}  
                    onChange={(e) => handleInputChange("typeProduit", e.target.value)}  
                    className="supplier-form-select"  
                    required  
                  >  
                    <option value="">Sélectionner un type</option>  
                    <option value="Butane">Butane</option>  
                    <option value="Propane">Propane</option>  
                  </select>  
                </div>  
              </div>  
  
              <div className="supplier-form-row">  
                <div className="supplier-form-group">  
                  <label htmlFor="quantite" className="supplier-form-label">Quantité (L)</label>  
                  <input  
                    id="quantite"  
                    type="number"  
                    placeholder="Ex: 500"  
                    value={formData.quantite}  
                    onChange={(e) => handleInputChange("quantite", e.target.value)}  
                    className="supplier-form-input"  
                    min="0"  
                    step="0.01"  
                    required  
                  />  
                </div>  
  
                <div className="supplier-form-group">  
                  <label htmlFor="prixUnitaire" className="supplier-form-label">Prix unitaire (MAD)</label>  
                  <input  
                    id="prixUnitaire"  
                    type="number"  
                    placeholder="Ex: 12.50"  
                    value={formData.prixUnitaire}  
                    onChange={(e) => handleInputChange("prixUnitaire", e.target.value)}  
                    className="supplier-form-input"  
                    min="0"  
                    step="0.01"  
                    required  
                  />  
                </div>  
              </div>  
  
              <div className="supplier-form-group">  
                <label className="supplier-form-label">Montant total</label>  
                <div className="supplier-total-display">  
                  {calculateTotal().toFixed(2)} MAD  
                </div>  
              </div>  
  
              <div className="supplier-form-group">  
                <label htmlFor="bonFile" className="supplier-form-label">Bon (PDF/Image)</label>  
                <input  
                  id="bonFile"  
                  type="file"  
                  accept=".pdf,.jpg,.jpeg,.png"  
                  onChange={handleFileChange}  
                  className="supplier-form-file"  
                />  
              </div>  
  
              <div className="supplier-form-actions">  
                <button type="button" className="supplier-cancel-button" onClick={() => setIsAddDialogOpen(false)}>  
                  Annuler  
                </button>  
                <button type="submit" className="supplier-submit-button">  
                  Ajouter  
                </button>  
              </div>  
            </form>  
          </div>  
        </div>  
      )}  
  
      {/* Modal pour modifier un bon */}  
      {isEditDialogOpen && (  
        <div className="supplier-modal-overlay" onClick={() => setIsEditDialogOpen(false)}>  
          <div className="supplier-modal-content" onClick={(e) => e.stopPropagation()}>  
            <div className="supplier-modal-header">  
              <h2 className="supplier-modal-title">Modifier Bon Fournisseur</h2>  
              <button className="supplier-modal-close" onClick={() => setIsEditDialogOpen(false)}>  
                <X className="supplier-close-icon" />  
              </button>  
            </div>  
              
            <form onSubmit={handleEditSubmit} className="supplier-modal-form">  
              <div className="supplier-form-row">  
                <div className="supplier-form-group">  
                  <label htmlFor="edit-date" className="supplier-form-label">Date</label>  
                  <input  
                    id="edit-date"  
                    type="date"  
                    value={formData.date}  
                    onChange={(e) => handleInputChange("date", e.target.value)}  
                    className="supplier-form-input"  
                    required  
                  />  
                </div>  
  
                <div className="supplier-form-group">  
                  <label htmlFor="edit-camion" className="supplier-form-label">Camion</label>  
                  <input  
                    id="edit-camion"  
                    type="text"  
                    placeholder="Ex: AB-123-CD"  
                    value={formData.camion}  
                    onChange={(e) => handleInputChange("camion", e.target.value)}  
                    className="supplier-form-input"  
                    required  
                  />  
                </div>  
              </div>  
  
              <div className="supplier-form-row">  
                <div className="supplier-form-group">  
                  <label htmlFor="edit-chauffeur" className="supplier-form-label">Chauffeur</label>  
                  <input  
                    id="edit-chauffeur"  
                    type="text"  
                    placeholder="Ex: Jean Dupont"  
                    value={formData.chauffeur}  
                    onChange={(e) => handleInputChange("chauffeur", e.target.value)}  
                    className="supplier-form-input"  
                    required  
                  />  
                </div>  
  
                <div className="supplier-form-group">  
                  <label htmlFor="edit-typeProduit" className="supplier-form-label">Type du produit</label>  
                  <select  
                    id="edit-typeProduit"  
                    value={formData.typeProduit}  
                    onChange={(e) => handleInputChange("typeProduit", e.target.value)}  
                    className="supplier-form-select"  
                    required  
                  >  
                    <option value="">Sélectionner un type</option>  
                    <option value="Butane">Butane</option>  
                    <option value="Propane">Propane</option>  
                  </select>  
                </div>  
              </div>  
  
              <div className="supplier-form-row">  
                <div className="supplier-form-group">  
                  <label htmlFor="edit-quantite" className="supplier-form-label">Quantité (L)</label>  
                  <input  
                    id="edit-quantite"  
                    type="number"  
                    placeholder="Ex: 500"  
                    value={formData.quantite}  
                    onChange={(e) => handleInputChange("quantite", e.target.value)}  
                    className="supplier-form-input"  
                    min="0"  
                    step="0.01"  
                    required  
                  />  
                </div>  
  
                <div className="supplier-form-group">  
                  <label htmlFor="edit-prixUnitaire" className="supplier-form-label">Prix unitaire (MAD)</label>  
                  <input  
                    id="edit-prixUnitaire"  
                    type="number"  
                    placeholder="Ex: 12.50"  
                    value={formData.prixUnitaire}  
                    onChange={(e) => handleInputChange("prixUnitaire", e.target.value)}  
                    className="supplier-form-input"  
                    min="0"  
                    step="0.01"  
                    required  
                  />  
                </div>  
              </div>  
  
              <div className="supplier-form-group">  
                <label className="supplier-form-label">Montant total</label>  
                <div className="supplier-total-display">  
                  {calculateTotal().toFixed(2)} MAD  
                </div>  
              </div>  
  
              <div className="supplier-form-group">  
                <label htmlFor="edit-bonFile" className="supplier-form-label">Nouveau bon (PDF/Image)</label>  
                <input  
                  id="edit-bonFile"  
                  type="file"  
                  accept=".pdf,.jpg,.jpeg,.png"  
                  onChange={handleFileChange}  
                  className="supplier-form-file"  
                />  
                <small className="supplier-file-note">Laissez vide pour conserver le bon actuel</small>  
              </div>  
  
              <div className="supplier-form-actions">  
                <button type="button" className="supplier-cancel-button" onClick={() => setIsEditDialogOpen(false)}>  
                  Annuler  
                </button>  
                <button type="submit" className="supplier-submit-button">  
                  Sauvegarder  
                </button>  
              </div>  
            </form>  
          </div>  
        </div>  
      )}  
    </div>  
  )  
}