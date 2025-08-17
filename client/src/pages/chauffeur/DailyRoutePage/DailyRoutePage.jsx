import { useEffect, useState } from "react"  
import {   
  MdLocalShipping as TruckIcon, 
  MdAccessTime as Clock,  
  MdSearch as Search,  
  MdFilterList as Filter,  
  MdRotateRight as Loader2  
} from "react-icons/md" 
import "./DailyRoutePage.css"
import { useNavigate } from 'react-router-dom'  
import { MdFlag as Flag } from 'react-icons/md'
  
// Mock data (pas besoin d'interfaces en JavaScript)  
const mockUser = {  
  id: "1",  
  name: "Jean Dupont",  
  role: "chauffeur",  
  truckId: "truck-001",  
}  
  
const mockDeliveries = [  
  {  
    id: "del-001",  
    customer: { id: "cust-001", name: "Restaurant Le Gourmet", phone: "01 23 45 67 89" },  
    address: {  
      id: "addr-001",  
      street: "15 Rue de la Paix",  
      city: "Paris",  
      postalCode: "75001",  
      region: "Île-de-France",  
    },  
    timeWindow: { start: "08:00", end: "10:00" },  
    status: "pending",  
    truck: { id: "truck-001", plateNumber: "AB-123-CD", model: "Mercedes Sprinter" },  
    orderNumber: "CMD-2024-001",  
    priority: "high",  
    estimatedDuration: 30,  
  },  
  {  
    id: "del-002",  
    customer: { id: "cust-002", name: "Boulangerie Martin", phone: "01 34 56 78 90" },  
    address: {  
      id: "addr-002",  
      street: "42 Avenue des Champs",  
      city: "Paris",  
      postalCode: "75008",  
      region: "Île-de-France",  
    },  
    timeWindow: { start: "10:30", end: "12:00" },  
    status: "in-progress",  
    truck: { id: "truck-001", plateNumber: "AB-123-CD", model: "Mercedes Sprinter" },  
    orderNumber: "CMD-2024-002",  
    priority: "medium",  
    estimatedDuration: 25,  
  },  
  {  
    id: "del-003",  
    customer: { id: "cust-003", name: "Hôtel Royal", phone: "01 45 67 89 01" },  
    address: { id: "addr-003", street: "8 Place Vendôme", city: "Paris", postalCode: "75001", region: "Île-de-France" },  
    timeWindow: { start: "14:00", end: "16:00" },  
    status: "delivered",  
    truck: { id: "truck-001", plateNumber: "AB-123-CD", model: "Mercedes Sprinter" },  
    orderNumber: "CMD-2024-003",  
    priority: "low",  
    estimatedDuration: 20,  
  },  
  {  
    id: "del-004",  
    customer: { id: "cust-004", name: "Café Central", phone: "01 56 78 90 12" },  
    address: {  
      id: "addr-004",  
      street: "25 Boulevard Saint-Germain",  
      city: "Paris",  
      postalCode: "75005",  
      region: "Île-de-France",  
    },  
    timeWindow: { start: "16:30", end: "18:00" },  
    status: "pending",  
    truck: { id: "truck-001", plateNumber: "AB-123-CD", model: "Mercedes Sprinter" },  
    orderNumber: "CMD-2024-004",  
    priority: "medium",  
    estimatedDuration: 35,  
  },  
]  
  
const fetchDeliveries = async () => {  
  await new Promise((resolve) => setTimeout(resolve, 1000))  
  return mockDeliveries  
}  
  
const getStatusColor = (status) => {  
  switch (status) {  
    case "pending":  
      return "status-pending"  
    case "in-progress":  
      return "status-in-progress"  
    case "delivered":  
      return "status-delivered"  
    case "cancelled":  
      return "status-cancelled"  
    default:  
      return "status-default"  
  }  
}  
  
const getStatusText = (status) => {  
  switch (status) {  
    case "pending":  
      return "En attente"  
    case "in-progress":  
      return "En cours"  
    case "delivered":  
      return "Livré"  
    case "cancelled":  
      return "Annulé"  
    default:  
      return status  
  }  
}  
  
const getPriorityColor = (priority) => {  
  switch (priority) {  
    case "high":  
      return "priority-high"  
    case "medium":  
      return "priority-medium"  
    case "low":  
      return "priority-low"  
    default:  
      return "priority-default"  
  }  
}  
  
export default function DailyRoutePage() {  
  const [user] = useState(mockUser)  
  const [deliveries, setDeliveries] = useState([])  
  const [filteredDeliveries, setFilteredDeliveries] = useState([])  
  const [loading, setLoading] = useState(true)  
  const [error, setError] = useState(null)  
  const [statusFilter, setStatusFilter] = useState("all")  
  const [searchTerm, setSearchTerm] = useState("") 
  const navigate = useNavigate() 
    const handleEndRoute = () => {  
    navigate('/chauffeur/end-route')  
  }  

  
  useEffect(() => {  
    const loadDeliveries = async () => {  
      try {  
        setLoading(true)  
        const data = await fetchDeliveries()  
        setDeliveries(data)  
        setFilteredDeliveries(data)  
      } catch (err) {  
        setError("Erreur lors du chargement des livraisons. Veuillez réessayer.")  
      } finally {  
        setLoading(false)  
      }  
    }  
  
    loadDeliveries()  
  }, [])  
  
  useEffect(() => {  
    let filtered = deliveries  
  
    if (statusFilter !== "all") {  
      filtered = filtered.filter((delivery) => delivery.status === statusFilter)  
    }  
  
    if (searchTerm) {  
      filtered = filtered.filter(  
        (delivery) =>  
          delivery.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||  
          delivery.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||  
          delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()),  
      )  
    }  
  
    setFilteredDeliveries(filtered)  
  }, [deliveries, statusFilter, searchTerm])  
  
  const updateDeliveryStatus = (deliveryId, newStatus) => {  
    setDeliveries((prev) =>  
      prev.map((delivery) => (delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery)),  
    )  
  }  
  
  const getDeliveryStats = () => {  
    const total = deliveries.length  
    const pending = deliveries.filter((d) => d.status === "pending").length  
    const inProgress = deliveries.filter((d) => d.status === "in-progress").length  
    const delivered = deliveries.filter((d) => d.status === "delivered").length  
  
    return { total, pending, inProgress, delivered }  
  }  
  
  const stats = getDeliveryStats()
  
  if (loading) {  
    return (  
      <div className="daily-route-layout">   
        <div className="daily-route-content">  
          <div className="loading-container">  
            <div className="loading-content">  
              <Loader2 className="loading-spinner" />  
              <p className="loading-text">Chargement de votre tournée...</p>  
            </div>  
          </div>  
        </div>  
      </div>  
    )  
  }  
  
  if (error) {  
    return (  
      <div className="daily-route-layout">  
        <div className="daily-route-content">  
          <div className="error-container">  
            <div className="error-card">  
              <div className="error-content">  
                <div className="error-icon">  
                  <span>⚠</span>  
                </div>  
                <h3 className="error-title">Erreur de chargement</h3>  
                <p className="error-message">{error}</p>  
                <button className="error-retry-btn" onClick={() => window.location.reload()}>  
                  Réessayer  
                </button>  
              </div>  
            </div>  
          </div>  
        </div>  
      </div>  
    )  
  }  
  
  return (  
    <div className="daily-route-layout">
        
      <div className="daily-route-content">  
        <main className="main-content">  
          {/* Stats Cards */}  
          <div className="stats-grid">  
            <div className="stat-card">  
              <div className="stat-content">  
                <div className="stat-info">  
                  <p className="stat-label">Total</p>  
                  <p className="stat-value">{stats.total}</p>  
                </div>  
                <div className="stat-icon stat-icon-blue">  
                  <TruckIcon />  
                </div>  
              </div>  
            </div>  
  
            <div className="stat-card">  
              <div className="stat-content">  
                <div className="stat-info">  
                  <p className="stat-label">En attente</p>  
                  <p className="stat-value stat-value-yellow">{stats.pending}</p>  
                </div>  
                <div className="stat-icon stat-icon-yellow">  
                  <Clock />  
                </div>  
              </div>  
            </div>  
  
            <div className="stat-card">  
              <div className="stat-content">  
                <div className="stat-info">  
                  <p className="stat-label">En cours</p>  
                  <p className="stat-value stat-value-blue">{stats.inProgress}</p>  
                </div>  
                <div className="stat-icon stat-icon-blue">  
                  <Loader2 />  
                </div>  
              </div>  
            </div>  
  
            <div className="stat-card">  
              <div className="stat-content">  
                <div className="stat-info">  
                  <p className="stat-label">Livrées</p>  
                  <p className="stat-value stat-value-green">{stats.delivered}</p>  
                </div>  
                <div className="stat-icon stat-icon-green">  
                  <span className="checkmark">✓</span>  
                </div>  
              </div>  
            </div>  
          </div>  

          <div className="route-actions-section">  
            <button   
              onClick={handleEndRoute}  
              className="end-route-btn"  
            >  
              <Flag className="end-route-icon" />  
              Fin de Tournée  
            </button>  
          </div>
  
          {/* Filters */}  
          <div className="filters-card">  
            <div className="filters-header">  
              <h3 className="filters-title">  
                <Filter className="filters-icon" />  
                <span>Filtres</span>  
              </h3>  
            </div>  
            <div className="filters-content">  
              <div className="filters-row">  
                <div className="search-container">  
                  <div className="search-input-wrapper">  
                    <Search className="search-icon" />  
                    <input  
                      type="text"  
                      placeholder="Rechercher par client, adresse ou numéro de commande..."  
                      value={searchTerm}  
                      onChange={(e) => setSearchTerm(e.target.value)}  
                      className="search-input"  
                    />  
                  </div>  
                </div>  
                <div className="status-filter">  
                  <select   
                    value={statusFilter}   
                    onChange={(e) => setStatusFilter(e.target.value)}  
                    className="status-select"  
                  >  
                    <option value="all">Tous les statuts</option>  
                    <option value="pending">En attente</option>  
                    <option value="in-progress">En cours</option>  
                    <option value="delivered">Livré</option>  
                    <option value="cancelled">Annulé</option>  
                  </select>  
                </div>  
              </div>  
            </div>  
          </div>  
  
          {/* Deliveries List */}  
          <div className="deliveries-container">  
            {filteredDeliveries.length === 0 ? (  
              <div className="empty-state-card">  
                <div className="empty-state-content">  
                  <TruckIcon className="empty-state-icon" />  
                  <h3 className="empty-state-title">Aucune livraison trouvée</h3>  
                  <p className="empty-state-message">  
                    {searchTerm || statusFilter !== "all"  
                      ? "Aucune livraison ne correspond à vos critères de recherche."  
                      : "Aucune livraison prévue pour aujourd'hui."}  
                  </p>  
                </div>  
              </div>  
            ) : (  
              filteredDeliveries.map((delivery) => (  
                <div key={delivery.id} className="delivery-card">  
                  <div className="delivery-content">  
                    <div className="delivery-main">  
                      {/* Colonne de gauche - Informations client */}  
                      <div className="delivery-left-info">  
                        <div className="delivery-customer-header">  
                          <div className={`priority-indicator ${getPriorityColor(delivery.priority)}`} />  
                          <h3 className="customer-name">{delivery.customer.name}</h3>  
                        </div>  
                        <p className="order-number">Commande: {delivery.orderNumber}</p>  
                        <p className="delivery-address">  
                          {delivery.address.street}, {delivery.address.city} {delivery.address.postalCode}  
                        </p>  
                        <p className="delivery-truck">  
                          {delivery.truck.model} - {delivery.truck.plateNumber}  
                        </p>  
                      </div>  
                
                      {/* Colonne du centre - Statut et horaires */}  
                      <div className="delivery-center-info">  
                        <div className={`status-badge ${getStatusColor(delivery.status)}`}>  
                          {getStatusText(delivery.status)}  
                        </div>  
                        <div className="delivery-time">  
                          <p className="time-window">  
                            {delivery.timeWindow.start} - {delivery.timeWindow.end}  
                          </p>  
                          <p className="time-duration">({delivery.estimatedDuration}min)</p>  
                        </div>  
                      </div>  
                
                      {/* Colonne de droite - Actions */}  
                      <div className="delivery-actions">  
                        {delivery.status === "pending" && (  
                          <button  
                            onClick={() => updateDeliveryStatus(delivery.id, "in-progress")}  
                            className="action-btn action-btn-start"  
                          >  
                            Commencer  
                          </button>  
                        )}  
                        {delivery.status === "in-progress" && (  
                          <button  
                            onClick={() => updateDeliveryStatus(delivery.id, "delivered")}  
                            className="action-btn action-btn-complete"  
                          >  
                            Marquer livré  
                          </button>  
                        )}  
                        <button className="action-btn action-btn-details">  
                          Détails  
                        </button>  
                      </div>  
                    </div>  
                  </div>  
                </div>  
              )) 
            )}  
          </div>  
        </main>  
      </div>  
    </div>  
  )  
}

                      