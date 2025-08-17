import { useState } from "react"  
import {   
  MdSearch as Search,   
  MdVisibility as Eye,  
  MdClose as X,  
  MdStar as Star,  
  MdStarBorder as StarBorder  
} from "react-icons/md"  
import "./suiviCommande.css"  
  
// Données étendues pour les commandes avec toutes les informations  
const ordersData = [  
  {  
    id: 1,  
    numeroCmd: "CMD-2024-001",  
    client: "Jean Dupont",  
    typeClient: "Particulier",  
    adresseComplete: "123 Rue Mohammed V, Quartier Maarif, Casablanca 20000",  
    region: "Casablanca",  
    date: "2024-01-15",  
    heure: "14:30",  
    typeProduit: "Butane",  
    prixUnitaire: 12.50,  
    prixLivraison: 25.00,  
    total: 1250.00,  
    statut: "En cours",  
    camion: "AB-123-CD",  
    commentaire: "Livraison urgente demandée par le client",  
    evaluation: 4  
  },  
  {  
    id: 2,  
    numeroCmd: "CMD-2024-002",  
    client: "Ahmed Benali",  
    typeClient: "Professionnel",  
    adresseComplete: "45 Avenue Hassan II, Agdal, Rabat 10000",  
    region: "Rabat",  
    date: "2024-01-16",  
    heure: "09:15",  
    typeProduit: "Propane",  
    prixUnitaire: 11.80,  
    prixLivraison: 20.00,  
    total: 890.50,  
    statut: "Livré",  
    camion: "EF-456-GH",  
    commentaire: "Client très satisfait du service",  
    evaluation: 5  
  },  
  {  
    id: 3,  
    numeroCmd: "CMD-2024-003",  
    client: "Fatima Zahra",  
    typeClient: "Particulier",  
    adresseComplete: "78 Boulevard Zerktouni, Gueliz, Marrakech 40000",  
    region: "Marrakech",  
    date: "2024-01-17",  
    heure: "16:45",  
    typeProduit: "Butane",  
    prixUnitaire: 12.50,  
    prixLivraison: 30.00,  
    total: 2100.75,  
    statut: "En préparation",  
    camion: "IJ-789-KL",  
    commentaire: "Demande de livraison en fin d'après-midi",  
    evaluation: 3  
  },  
  {  
    id: 4,  
    numeroCmd: "CMD-2024-004",  
    client: "Mohamed Alami",  
    typeClient: "Industriel",  
    adresseComplete: "12 Zone Industrielle Sidi Brahim, Fès 30000",  
    region: "Fès",  
    date: "2024-01-18",  
    heure: "08:00",  
    typeProduit: "Propane",  
    prixUnitaire: 11.80,  
    prixLivraison: 15.00,  
    total: 675.25,  
    statut: "Annulé",  
    camion: "-",  
    commentaire: "Commande annulée par le client pour raisons budgétaires",  
    evaluation: 0  
  },  
  {  
    id: 5,  
    numeroCmd: "CMD-2024-005",  
    client: "Khadija Bennani",  
    typeClient: "Professionnel",  
    adresseComplete: "56 Rue de la Liberté, Centre-ville, Tanger 90000",  
    region: "Tanger",  
    date: "2024-01-19",  
    heure: "11:20",  
    typeProduit: "Butane",  
    prixUnitaire: 12.50,  
    prixLivraison: 22.00,  
    total: 1450.00,  
    statut: "En cours",  
    camion: "MN-012-OP",  
    commentaire: "Restaurant, livraison pendant les heures creuses",  
    evaluation: 4  
  },  
  {  
    id: 6,  
    numeroCmd: "CMD-2024-006",  
    client: "Youssef Idrissi",  
    typeClient: "Particulier",  
    adresseComplete: "34 Avenue du Prince Héritier, Talborjt, Agadir 80000",  
    region: "Agadir",  
    date: "2024-01-20",  
    heure: "13:15",  
    typeProduit: "Propane",  
    prixUnitaire: 11.80,  
    prixLivraison: 18.00,  
    total: 980.30,  
    statut: "Livré",  
    camion: "QR-345-ST",  
    commentaire: "Livraison rapide et efficace",  
    evaluation: 5  
  },  
]  
  
export default function OrderTrackingManagement() {  
  const [searchTerm, setSearchTerm] = useState("")  
  const [orders] = useState(ordersData)  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)  
  const [selectedOrder, setSelectedOrder] = useState(null)  
  
  // Filtrer les commandes selon le terme de recherche  
  const filteredOrders = orders.filter(  
    (order) =>  
      order.numeroCmd.toLowerCase().includes(searchTerm.toLowerCase()) ||  
      order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||  
      order.region.toLowerCase().includes(searchTerm.toLowerCase()) ||  
      order.statut.toLowerCase().includes(searchTerm.toLowerCase()) ||  
      order.camion.toLowerCase().includes(searchTerm.toLowerCase()) ||  
      order.date.includes(searchTerm)  
  )  
  
  const getStatusBadgeClass = (statut) => {  
    switch (statut.toLowerCase()) {  
      case 'livré':  
        return 'tracking-badge-delivered'  
      case 'en cours':  
        return 'tracking-badge-in-progress'  
      case 'en préparation':  
        return 'tracking-badge-preparing'  
      case 'annulé':  
        return 'tracking-badge-cancelled'  
      default:  
        return 'tracking-badge-default'  
    }  
  }  
  
  const getClientTypeBadgeClass = (typeClient) => {  
    switch (typeClient.toLowerCase()) {  
      case 'particulier':  
        return 'tracking-client-badge-particulier'  
      case 'professionnel':  
        return 'tracking-client-badge-professionnel'  
      case 'industriel':  
        return 'tracking-client-badge-industriel'  
      default:  
        return 'tracking-client-badge-default'  
    }  
  }  
  
  const handleViewDetails = (order) => {  
    setSelectedOrder(order)  
    setIsDetailsModalOpen(true)  
  }  
  
  const renderStars = (rating) => {  
    const stars = []  
    for (let i = 1; i <= 5; i++) {  
      stars.push(  
        i <= rating ?   
        <Star key={i} className="tracking-star-filled" /> :   
        <StarBorder key={i} className="tracking-star-empty" />  
      )  
    }  
    return stars  
  }  
  
  return (  
    <div className="tracking-management-layout">  
        
      <div className="tracking-management-wrapper">  
        <div className="tracking-management-container">  
          <div className="tracking-management-content">  
            {/* En-tête */}  
            <div className="tracking-page-header">  
              <h1 className="tracking-page-title">Suivi des Commandes</h1>  
              <p className="tracking-page-subtitle">Suivez l'état de toutes les commandes en temps réel</p>  
            </div>  
  
            {/* Barre de recherche */}  
            <div className="tracking-search-section">  
              <div className="tracking-search-container">  
                <Search className="tracking-search-icon" />  
                <input  
                  type="text"  
                  placeholder="Rechercher par N° commande, client, région, statut..."  
                  value={searchTerm}  
                  onChange={(e) => setSearchTerm(e.target.value)}  
                  className="tracking-search-input"  
                />  
              </div>  
            </div>  
  
            {/* Tableau */}  
            <div className="tracking-table-card">  
              <div className="tracking-table-header">  
                <h3 className="tracking-table-title">Liste des Commandes</h3>  
              </div>  
              <div className="tracking-table-content">  
                <div className="tracking-table-container">  
                  <table className="tracking-orders-table">  
                    <thead>  
                      <tr>  
                        <th>N° Cmd</th>  
                        <th>Client</th>  
                        <th>Région</th>  
                        <th>Date</th>  
                        <th>Total (MAD)</th>  
                        <th>Statut</th>  
                        <th>Camion</th>  
                        <th>Détails</th>  
                      </tr>  
                    </thead>  
                    <tbody>  
                      {filteredOrders.map((order) => (  
                        <tr key={order.id}>  
                          <td className="tracking-font-medium">{order.numeroCmd}</td>  
                          <td>{order.client}</td>  
                          <td>{order.region}</td>  
                          <td>{new Date(order.date).toLocaleDateString('fr-FR')}</td>  
                          <td className="tracking-font-medium">{order.total.toFixed(2)} MAD</td>  
                          <td>  
                            <span className={`tracking-badge ${getStatusBadgeClass(order.statut)}`}>  
                              {order.statut}  
                            </span>  
                          </td>  
                          <td>{order.camion}</td>  
                          <td>  
                            <button   
                              className="tracking-details-button"  
                              onClick={() => handleViewDetails(order)}  
                            >  
                              <Eye className="tracking-details-icon" />  
                            </button>  
                          </td>  
                        </tr>  
                      ))}  
                    </tbody>  
                  </table>  
  
                  {filteredOrders.length === 0 && (  
                    <div className="tracking-no-results">  
                      Aucune commande trouvée pour votre recherche.  
                    </div>  
                  )}  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
      </div>  
  
      {/* Modal de détails de commande */}  
      {isDetailsModalOpen && selectedOrder && (  
        <div className="tracking-modal-overlay" onClick={() => setIsDetailsModalOpen(false)}>  
          <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>  
            <div className="tracking-modal-header">  
              <h2 className="tracking-modal-title">Détails de la commande {selectedOrder.numeroCmd}</h2>  
              <button className="tracking-modal-close" onClick={() => setIsDetailsModalOpen(false)}>  
                <X className="tracking-close-icon" />  
              </button>  
            </div>  
              
            <div className="tracking-modal-body">  
              <div className="tracking-details-grid">  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Nom du client</label>  
                  <span className="tracking-detail-value">{selectedOrder.client}</span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Type de client</label>  
                  <span className={`tracking-client-badge ${getClientTypeBadgeClass(selectedOrder.typeClient)}`}>  
                    {selectedOrder.typeClient}  
                  </span>  
                </div>  
  
                <div className="tracking-detail-item tracking-full-width">  
                  <label className="tracking-detail-label">Adresse complète</label>  
                  <span className="tracking-detail-value">{selectedOrder.adresseComplete}</span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Région</label>  
                  <span className="tracking-detail-value">{selectedOrder.region}</span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Type de produit</label>  
                  <span className="tracking-detail-value">{selectedOrder.typeProduit}</span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Prix unitaire</label>  
                  <span className="tracking-detail-value">{selectedOrder.prixUnitaire.toFixed(2)} MAD</span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Prix de livraison</label>  
                  <span className="tracking-detail-value">{selectedOrder.prixLivraison.toFixed(2)} MAD</span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Total</label>  
                  <span className="tracking-detail-value tracking-total-highlight">{selectedOrder.total.toFixed(2)} MAD</span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Date et heure de commande</label>  
                  <span className="tracking-detail-value">  
                    {new Date(selectedOrder.date).toLocaleDateString('fr-FR')} à {selectedOrder.heure}  
                  </span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">Camion</label>  
                  <span className="tracking-detail-value">{selectedOrder.camion}</span>  
                </div>  
  
                <div className="tracking-detail-item">  
                  <label className="tracking-detail-label">État de la commande</label>  
                  <span className={`tracking-badge ${getStatusBadgeClass(selectedOrder.statut)}`}>  
                    {selectedOrder.statut}  
                  </span>  
                </div>  
  
                <div className="tracking-detail-item tracking-full-width">  
                  <label className="tracking-detail-label">Évaluation</label>  
                  <div className="tracking-rating">  
                    {renderStars(selectedOrder.evaluation)}  
                    <span className="tracking-rating-text">({selectedOrder.evaluation}/5)</span>  
                  </div>  
                </div>  
  
                <div className="tracking-detail-item tracking-full-width">  
                  <label className="tracking-detail-label">Commentaire ou réclamation</label>  
                  <span className="tracking-detail-value">{selectedOrder.commentaire || "Aucun commentaire"}</span>  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
      )}  
    </div>  
  )  
}