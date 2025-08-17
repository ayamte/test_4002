import { useState, useEffect } from "react"        
import {         
  MdSearch as Search,         
  MdAdd as Plus,         
  MdEdit as Edit,        
  MdDelete as Delete,        
  MdClose as X        
} from "react-icons/md"        
import "./gestionClient.css"             
import { clientService } from '../../../services/clientService'  
// ✅ SUPPRIMER l'import CityRegionSelector
// import CityRegionSelector from '../../../components/common/CityRegionSelector';  
  
export default function ClientManagement() {      
  const [searchTerm, setSearchTerm] = useState("")      
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)      
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)      
  const [clients, setClients] = useState([])      
  const [editingClient, setEditingClient] = useState(null)      
  const [loading, setLoading] = useState(true)    
  const [error, setError] = useState("")    
  const [isLoading, setIsLoading] = useState(false)  
  // ✅ SUPPRIMER les états pour les sélecteurs de ville et région
  // const [selectedCity, setSelectedCity] = useState('');  
  // const [selectedRegion, setSelectedRegion] = useState('');   
    
  const [formData, setFormData] = useState({      
    // Champs communs  
    email: "",    
    telephone: "",    
    adresse: "",    
    type: "",    
    statut: "ACTIF",  
        
    // Champs pour particuliers    
    prenom: "",    
    nom: "",    
    civilite: "M",    
      
    // Champs pour entreprises  
    raison_sociale: "",  
    ice: "",  
    patente: "",  
    rc: "",  
    ville_rc: "",  
  })      

  // ✅ Fonction utilitaire corrigée - suppression des références aux régions
  const transformClientData = (customers) => {  
    return customers  
      .filter(customer => {  
        if (customer.type_client === 'PHYSIQUE' && customer.physical_user_id?.moral_user_id) {  
          return false;  
        }  
        return true;  
      })  
      .map(customer => ({    
        id: customer._id,    
        nom: customer.physical_user_id ?     
          `${customer.physical_user_id.first_name} ${customer.physical_user_id.last_name}` :    
          customer.moral_user_id?.raison_sociale || 'N/A',    
        type: customer.type_client === 'PHYSIQUE' ? 'Particulier' : 'Entreprise',    
        telephone: customer.physical_user_id?.telephone_principal ||     
                  customer.moral_user_id?.telephone_principal || 'N/A',    
        // ✅ SUPPRIMER les références aux régions
        // region: customer.physical_user_id?.region_principale?.nom ||     
        //       customer.moral_user_id?.region_principale?.nom || 'N/A',    
        email: customer.physical_user_id?.user_id?.email ||     
              customer.moral_user_id?.user_id?.email || 'N/A',       
        adresse: 'Voir adresses sauvegardées',
        statut: customer.statut,    
        city: 'Casablanca', // ✅ Ville par défaut
        // Champs détaillés pour l'édition    
        civilite: customer.physical_user_id?.civilite || '',    
        prenom: customer.physical_user_id?.first_name || '',    
        nom_seul: customer.physical_user_id?.last_name || '',    
        ice: customer.moral_user_id?.ice || '',  
        raison_sociale: customer.moral_user_id?.raison_sociale || '',  
        patente: customer.moral_user_id?.patente || '',  
        rc: customer.moral_user_id?.rc || '',  
        ville_rc: customer.moral_user_id?.ville_rc || ''
        // ✅ SUPPRIMER region_id et city_id car plus dans les modèles utilisateur
      }));  
  };
    
  // Charger les clients depuis l'API    
  useEffect(() => {    
    const fetchClients = async () => {    
      try {    
        setLoading(true);    
        const response = await clientService.getAll();    
            
        if (response.success) {    
          const transformedClients = transformClientData(response.data);
          setClients(transformedClients);    
        } else {    
          setError("Erreur lors du chargement des clients");    
        }    
      } catch (err) {    
        setError("Erreur de connexion à l'API");    
        console.error('Erreur:', err);    
      } finally {    
        setLoading(false);    
      }    
    };    
    
    fetchClients();    
  }, []);    
      
  // ✅ Filtrer les clients - suppression de la recherche par région      
  const filteredClients = clients.filter(      
    (client) =>      
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||      
      client.type.toLowerCase().includes(searchTerm.toLowerCase()) ||      
      // ✅ SUPPRIMER client.region.toLowerCase().includes(searchTerm.toLowerCase()) ||      
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.statut.toLowerCase().includes(searchTerm.toLowerCase())      
  )      
      
  // Calculer les statistiques  
  const totalClients = clients.length      
  const particuliers = clients.filter((client) => client.type === "Particulier").length      
  const entreprises = clients.filter((client) => client.type === "Entreprise").length      
      
  const handleInputChange = (field, value) => {      
    setFormData((prev) => ({      
      ...prev,      
      [field]: value,      
    }))      
  }      

  // Fonction pour recharger les clients après modification
  const reloadClients = async () => {
    try {
      const updatedResponse = await clientService.getAll();
      if (updatedResponse.success) {
        const transformedClients = transformClientData(updatedResponse.data);
        setClients(transformedClients);
      }
    } catch (err) {
      console.error('Erreur lors du rechargement:', err);
    }
  };

  // ✅ Fonction corrigée - suppression des sélecteurs
  const resetForm = () => {
    setFormData({    
      email: "",  
      telephone: "",  
      adresse: "",  
      type: "",  
      statut: "ACTIF",
      prenom: "",  
      nom: "",  
      civilite: "M",  
      raison_sociale: "",  
      ice: "",  
      patente: "",  
      rc: "",  
      ville_rc: "",  
    });
    // ✅ SUPPRIMER les reset des sélecteurs
    // setSelectedCity('');
    // setSelectedRegion('');
  };
      
  // ✅ handleAddSubmit corrigé - suppression des références aux régions
  const handleAddSubmit = async (e) => {      
    e.preventDefault()      
    setIsLoading(true)    
    setError("")    
    
    try {    
      const clientData = {    
        type_client: formData.type === 'Particulier' ? 'PHYSIQUE' : 'MORAL',    
        profile: formData.type === 'Particulier' ? {      
          first_name: formData.prenom,      
          last_name: formData.nom,      
          civilite: formData.civilite,    
          telephone_principal: formData.telephone,      
          email: formData.email,      
          adresse_principale: formData.adresse
          // ✅ SUPPRIMER city_id: selectedCity,
          // ✅ SUPPRIMER region_principale: selectedRegion
        } : {      
          raison_sociale: formData.raison_sociale,    
          ice: formData.ice,  
          patente: formData.patente,  
          rc: formData.rc,  
          ville_rc: formData.ville_rc,  
          telephone_principal: formData.telephone,    
          // ✅ SUPPRIMER city_id: selectedCity,
          // ✅ SUPPRIMER region_principale: selectedRegion,
          email: formData.email,    
          adresse_principale: formData.adresse
        },
        statut: formData.statut
      };    
    
      const response = await clientService.create(clientData);    
          
      if (response.success) {    
        await reloadClients();
        setIsAddDialogOpen(false);    
        resetForm();
      } else {    
        setError(response.message || "Erreur lors de l'ajout du client");    
      }    
    } catch (err) {    
      setError("Erreur lors de l'ajout du client");    
      console.error('Erreur:', err);    
    } finally {    
      setIsLoading(false);    
    }    
  }      
    
  const handleAddClick = () => {      
    resetForm();
    setIsAddDialogOpen(true)      
  }      
      
  // ✅ handleEditSubmit corrigé - suppression des références aux régions
  const handleEditSubmit = async (e) => {      
    e.preventDefault()      
    setIsLoading(true)    
    setError("")    
    
    try {      
      const clientData = {    
        type_client: formData.type === 'Particulier' ? 'PHYSIQUE' : 'MORAL',    
        profile: formData.type === 'Particulier' ? {    
          first_name: formData.prenom,    
          last_name: formData.nom,    
          civilite: formData.civilite,  
          telephone_principal: formData.telephone,    
          email: formData.email,    
          adresse_principale: formData.adresse
          // ✅ SUPPRIMER city_id: selectedCity,
          // ✅ SUPPRIMER region_principale: selectedRegion
        } : {    
          raison_sociale: formData.raison_sociale,    
          ice: formData.ice,  
          patente: formData.patente,  
          rc: formData.rc,  
          ville_rc: formData.ville_rc,  
          telephone_principal: formData.telephone,    
          // ✅ SUPPRIMER city_id: selectedCity,
          // ✅ SUPPRIMER region_principale: selectedRegion,
          email: formData.email,    
          adresse_principale: formData.adresse
        },
        statut: formData.statut
      };    
    
      const response = await clientService.update(editingClient.id, clientData);    
          
      if (response.success) {    
        await reloadClients();
        setIsEditDialogOpen(false);    
        setEditingClient(null);    
        resetForm();
      } else {    
        setError(response.message || "Erreur lors de la modification du client");    
      }    
    } catch (err) {    
      setError("Erreur lors de la modification du client");    
      console.error('Erreur:', err);    
    } finally {    
      setIsLoading(false);    
    }    
  }      
      
  // ✅ handleEdit corrigé - suppression des sélecteurs
  const handleEdit = (client) => {  
    setEditingClient(client)  
    
    // ✅ SUPPRIMER l'initialisation des sélecteurs
    // setSelectedCity(client.city_id || '');
    // setSelectedRegion(client.region_id || '');
    
    setFormData({  
      email: client.email,  
      telephone: client.telephone,  
      adresse: client.adresse,  
      type: client.type,  
      statut: client.statut || "ACTIF",  
      // Pour particuliers  
      prenom: client.prenom || "",  
      nom: client.nom_seul || "",  
      civilite: client.civilite || "M",  
      // Pour entreprises  
      raison_sociale: client.raison_sociale || (client.type === "Entreprise" ? client.nom : ""),  
      ice: client.ice || "",  
      patente: client.patente || "",
      rc: client.rc || "",
      ville_rc: client.ville_rc || "",
    })  
    setIsEditDialogOpen(true)  
  }
      
  const handleDelete = async (clientId) => {      
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {      
      try {    
        setError("");    
        const response = await clientService.delete(clientId);    
            
        if (response.success) {    
          setClients(clients.filter(client => client.id !== clientId));    
        } else {    
          setError(response.message || "Erreur lors de la suppression du client");    
        }    
      } catch (err) {    
        setError("Erreur lors de la suppression du client");    
        console.error('Erreur:', err);    
      }    
    }      
  }      
      
  const getTypeBadge = (type) => {      
    switch (type) {      
      case "Particulier":      
        return <span className="badge badge-particulier">Particulier</span>      
      case "Entreprise":      
        return <span className="badge badge-professionnel">Entreprise</span>      
      default:      
        return <span className="badge badge-default">{type}</span>      
    }      
  }

  const getStatutBadge = (statut) => {
    switch (statut) {
      case "ACTIF":
        return <span className="badge badge-success">Actif</span>
      case "INACTIF":
        return <span className="badge badge-secondary">Inactif</span>
      case "SUSPENDU":
        return <span className="badge badge-warning">Suspendu</span>
      case "EN_ATTENTE":
        return <span className="badge badge-info">En attente</span>
      default:
        return <span className="badge badge-default">{statut}</span>
    }
  }
    
  if (loading) {    
    return (    
      <div className="client-management-layout">    
        <div className="client-management-wrapper">    
          <div style={{ padding: '20px', textAlign: 'center' }}>    
            Chargement des clients...    
          </div>    
        </div>    
      </div>    
    );    
  }    
      
  return (      
    <div className="client-management-layout">  
      <div className="client-management-wrapper">      
        <div className="client-management-container">      
          <div className="client-management-content">      
            {/* En-tête */}      
            <div className="page-header">      
              <h1 className="page-title">Gestion des Clients</h1>        
              <p className="page-subtitle">Gérez votre base de clients</p>          
            </div>          
        
            {/* Affichage des erreurs */}        
            {error && (        
              <div className="error-alert" style={{         
                backgroundColor: '#fee',         
                color: '#c33',         
                padding: '10px',         
                borderRadius: '4px',    
                marginBottom: '20px'         
              }}>        
                {error}        
              </div>        
            )}        
          
            {/* Statistiques */}          
            <div className="stats-grid">          
              <div className="stat-card gradient-card">          
                <div className="stat-card-header">          
                  <div className="stat-content">          
                    <h3 className="stat-label">Total Clients</h3>          
                    <div className="stat-value">{totalClients}</div>          
                    <p className="stat-description">Clients enregistrés</p>          
                  </div>          
                </div>          
              </div>          
                    
              <div className="stat-card gradient-card">          
                <div className="stat-card-header">          
                  <div className="stat-content">          
                    <h3 className="stat-label">Particuliers</h3>          
                    <div className="stat-value">{particuliers}</div>          
                    <p className="stat-description">Clients particuliers</p>          
                  </div>          
                </div>          
              </div>          
                    
              <div className="stat-card gradient-card">          
                <div className="stat-card-header">         
                  <div className="stat-content">            
                    <h3 className="stat-label">Entreprises</h3>            
                    <div className="stat-value">{entreprises}</div>            
                    <p className="stat-description">Clients entreprises</p>            
                  </div>            
                </div>            
              </div>            
            </div>            
            
            {/* Bouton Ajouter Client */}            
            <div className="action-section">            
              <button className="add-button" onClick={handleAddClick}>            
                <Plus className="button-icon" />            
                Ajouter Client            
              </button>            
            </div>            
            
            {/* Barre de recherche */}            
            <div className="search-section">            
              <div className="search-container">            
                <Search className="search-icon" />            
                <input            
                  type="text"            
                  placeholder="Rechercher par nom, type, email ou statut..." // ✅ Suppression de "région"            
                  value={searchTerm}            
                  onChange={(e) => setSearchTerm(e.target.value)}            
                  className="search-input"            
                />            
              </div>            
            </div>            
            
            {/* ✅ Tableau des clients - suppression de la colonne Région */}            
            <div className="table-card">            
              <div className="table-header">            
                <h3 className="table-title">Liste des Clients</h3>            
              </div>            
              <div className="table-content">            
                <div className="table-container">            
                  <table className="clients-table">            
                    <thead>            
                      <tr>            
                        <th>Nom</th>            
                        <th>Type</th>            
                        <th>Téléphone</th>            
                        {/* ✅ SUPPRIMER <th>Région</th> */}            
                        <th>Email</th>     
                        <th>Statut</th>           
                        <th>Actions</th>            
                      </tr>            
                    </thead>            
                    <tbody>            
                      {filteredClients.map((client) => (            
                        <tr key={client.id}>            
                          <td className="font-medium">{client.nom}</td>            
                          <td>{getTypeBadge(client.type)}</td>            
                          <td>{client.telephone}</td>            
                          {/* ✅ SUPPRIMER <td>{client.region}</td> */}            
                          <td>{client.email}</td>            
                          <td>{getStatutBadge(client.statut)}</td>    
                          <td>            
                            <div className="action-buttons">            
                              <button             
                                className="edit-action-button"            
                                onClick={() => handleEdit(client)}            
                              >            
                                <Edit className="action-icon" />            
                              </button>            
                              <button             
                                className="delete-action-button"            
                                onClick={() => handleDelete(client.id)}            
                              >            
                                <Delete className="action-icon" />            
                              </button>            
                            </div>            
                          </td>            
                        </tr>            
                      ))}            
                    </tbody>            
                  </table>            
                  {filteredClients.length === 0 && (            
                    <div className="no-results">            
                      Aucun client trouvé pour votre recherche.            
                    </div>            
                  )}            
                </div>            
              </div>            
            </div>            
            
            {/* ✅ Modal d'ajout - suppression du CityRegionSelector */}            
            {isAddDialogOpen && (            
              <div className="modal-overlay" onClick={() => setIsAddDialogOpen(false)}>            
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>            
                  <div className="modal-header">            
                    <h3 className="modal-title">Ajouter un Client</h3>            
                    <button             
                      className="modal-close"            
                      onClick={() => setIsAddDialogOpen(false)}            
                    >            
                      <X className="close-icon" />            
                    </button>            
                  </div>            
                  <form onSubmit={handleAddSubmit} className="modal-form">            
                    <div className="form-grid">            
                      {/* Email et Type */}    
                      <div className="form-group">      
                        <label className="form-label">Email *</label>      
                        <input      
                          type="email"      
                          value={formData.email}      
                          onChange={(e) => handleInputChange("email", e.target.value)}      
                          className="form-input"      
                          required      
                        />      
                      </div>      
      
                      <div className="form-group">      
                        <label className="form-label">Type *</label>      
                        <select      
                          value={formData.type}      
                          onChange={(e) => handleInputChange("type", e.target.value)}      
                          className="form-select"      
                          required      
                        >      
                          <option value="">Sélectionner un type</option>      
                          <option value="Particulier">Particulier</option>      
                          <option value="Entreprise">Entreprise</option>      
                        </select>      
                      </div>      
      
                      {/* Champs spécifiques aux particuliers */}      
                      {formData.type === "Particulier" && (      
                        <>      
                          <div className="form-group">      
                            <label className="form-label">Nom *</label>      
                            <input      
                              type="text"      
                              value={formData.nom}      
                              onChange={(e) => handleInputChange("nom", e.target.value)}      
                              className="form-input"      
                              required      
                            />      
                          </div>      
                            
                          <div className="form-group">      
                            <label className="form-label">Prénom *</label>      
                            <input      
                              type="text"      
                              value={formData.prenom}      
                              onChange={(e) => handleInputChange("prenom", e.target.value)}      
                              className="form-input"      
                              required      
                            />      
                          </div>      
                            
                          <div className="form-group">      
                            <label className="form-label">Téléphone *</label>      
                            <input      
                              type="tel"      
                              value={formData.telephone}      
                              onChange={(e) => handleInputChange("telephone", e.target.value)}      
                              className="form-input"      
                              required      
                            />      
                          </div>      
                            
                          <div className="form-group">      
                            <label className="form-label">Civilité *</label>      
                            <select      
                              value={formData.civilite}      
                              onChange={(e) => handleInputChange("civilite", e.target.value)}      
                              className="form-select"      
                              required      
                            >      
                              <option value="M">M.</option>      
                              <option value="Mme">Mme</option>      
                              <option value="Mlle">Mlle</option>      
                            </select>      
                          </div>      
                            
                          {/* ✅ SUPPRIMER CityRegionSelector */}  
                            
                          <div className="form-group">      
                            <label className="form-label">Adresse</label>      
                            <textarea      
                              value={formData.adresse}      
                              onChange={(e) => handleInputChange("adresse", e.target.value)}      
                              className="form-textarea"      
                              rows="3"      
                            />      
                          </div>      
                            
                          <div className="form-group">      
                            <label className="form-label">Statut *</label>      
                            <select      
                              value={formData.statut}      
                              onChange={(e) => handleInputChange("statut", e.target.value)}      
                              className="form-select"      
                              required      
                            >      
                              <option value="ACTIF">Actif</option>      
                              <option value="INACTIF">Inactif</option>      
                              <option value="SUSPENDU">Suspendu</option>      
                              <option value="EN_ATTENTE">En attente</option>      
                            </select>      
                          </div>      
                        </>      
                      )}      
    
                      {/* Champs spécifiques aux entreprises */}      
                      {formData.type === "Entreprise" && (      
                        <>      
                          <div className="form-group">      
                            <label className="form-label">Raison sociale *</label>      
                            <input      
                              type="text"      
                              value={formData.raison_sociale}      
                              onChange={(e) => handleInputChange("raison_sociale", e.target.value)}      
                              className="form-input"      
                              required      
                            />      
                          </div>      
    
                          <div className="form-group">      
                            <label className="form-label">Téléphone *</label>      
                            <input      
                              type="tel"      
                              value={formData.telephone}      
                              onChange={(e) => handleInputChange("telephone", e.target.value)}      
                              className="form-input"      
                              required      
                            />      
                          </div>      
    
                          <div className="form-group">      
                            <label className="form-label">ICE</label>      
                            <input      
                              type="text"      
                              value={formData.ice}      
                              onChange={(e) => handleInputChange("ice", e.target.value)}      
                              className="form-input"      
                            />      
                          </div>      
                              
                          <div className="form-group">      
                            <label className="form-label">Patente</label>      
                            <input      
                              type="text"      
                              value={formData.patente}      
                              onChange={(e) => handleInputChange("patente", e.target.value)}      
                              className="form-input"      
                            />      
                          </div>      
                              
                          <div className="form-group">      
                            <label className="form-label">RC</label>      
                            <input      
                              type="text"      
                              value={formData.rc}      
                              onChange={(e) => handleInputChange("rc", e.target.value)}      
                              className="form-input"      
                            />      
                          </div>      
                              
                          <div className="form-group">      
                            <label className="form-label">Ville RC</label>      
                            <input      
                              type="text"      
                              value={formData.ville_rc}      
                              onChange={(e) => handleInputChange("ville_rc", e.target.value)}      
                              className="form-input"      
                            />      
                          </div>      
                              
                          {/* ✅ SUPPRIMER CityRegionSelector */}  
    
                          <div className="form-group">      
                            <label className="form-label">Statut *</label>      
                            <select      
                              value={formData.statut}      
                              onChange={(e) => handleInputChange("statut", e.target.value)}      
                              className="form-select"      
                              required      
                            >      
                              <option value="ACTIF">Actif</option>      
                              <option value="INACTIF">Inactif</option>      
                              <option value="SUSPENDU">Suspendu</option>      
                              <option value="EN_ATTENTE">En attente</option>      
                            </select>      
                          </div>    
    
                          <div className="form-group">      
                            <label className="form-label">Adresse</label>      
                            <textarea      
                              value={formData.adresse}      
                              onChange={(e) => handleInputChange("adresse", e.target.value)}      
                              className="form-textarea"      
                              rows="3"      
                            />      
                          </div>      
                        </>      
                      )}      
                    </div>            
                    <div className="form-actions">            
                      <button             
                        type="button"            
                        onClick={() => setIsAddDialogOpen(false)}            
                        className="cancel-button"            
                      >            
                        Annuler     
                      </button>              
                      <button               
                        type="submit"              
                        className="submit-button"              
                        disabled={isLoading}              
                      >              
                        {isLoading ? "Ajout..." : "Ajouter"}              
                      </button>              
                    </div>              
                  </form>              
                </div>              
              </div>              
            )}              
              
            {/* ✅ Modal de modification - suppression du CityRegionSelector */}              
            {isEditDialogOpen && (              
              <div className="modal-overlay" onClick={() => setIsEditDialogOpen(false)}>              
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>              
                  <div className="modal-header">              
                    <h3 className="modal-title">Modifier le Client</h3>              
                    <button               
                      className="modal-close"              
                      onClick={() => setIsEditDialogOpen(false)}              
                    >              
                      <X className="close-icon" />              
                    </button>              
                  </div>              
                  <form onSubmit={handleEditSubmit} className="modal-form">              
                    <div className="form-grid">              
                      {/* Email et Type */}      
                      <div className="form-group">        
                        <label className="form-label">Email *</label>        
                        <input        
                          type="email"        
                          value={formData.email}        
                          onChange={(e) => handleInputChange("email", e.target.value)}        
                          className="form-input"        
                          required        
                        />        
                      </div>        
        
                      <div className="form-group">        
                        <label className="form-label">Type *</label>        
                        <select        
                          value={formData.type}        
                          onChange={(e) => handleInputChange("type", e.target.value)}        
                          className="form-select"        
                          required        
                        >        
                          <option value="">Sélectionner un type</option>        
                          <option value="Particulier">Particulier</option>        
                          <option value="Entreprise">Entreprise</option>        
                        </select>        
                      </div>        
        
                      {/* Champs spécifiques aux particuliers */}        
                      {formData.type === "Particulier" && (        
                        <>        
                          <div className="form-group">        
                            <label className="form-label">Nom *</label>        
                            <input        
                              type="text"        
                              value={formData.nom}        
                              onChange={(e) => handleInputChange("nom", e.target.value)}        
                              className="form-input"        
                              required        
                            />        
                          </div>        
                              
                          <div className="form-group">        
                            <label className="form-label">Prénom *</label>        
                            <input        
                              type="text"        
                              value={formData.prenom}        
                              onChange={(e) => handleInputChange("prenom", e.target.value)}        
                              className="form-input"        
                              required        
                            />        
                          </div>        
                              
                          <div className="form-group">        
                            <label className="form-label">Téléphone *</label>        
                            <input        
                              type="tel"        
                              value={formData.telephone}        
                              onChange={(e) => handleInputChange("telephone", e.target.value)}        
                              className="form-input"        
                              required        
                            />        
                          </div>        
                              
                          <div className="form-group">        
                            <label className="form-label">Civilité *</label>        
                            <select        
                              value={formData.civilite}        
                              onChange={(e) => handleInputChange("civilite", e.target.value)}        
                              className="form-select"        
                              required        
                            >        
                              <option value="M">M.</option>        
                              <option value="Mme">Mme</option>        
                              <option value="Mlle">Mlle</option>        
                            </select>        
                          </div>        
                              
                          {/* ✅ SUPPRIMER CityRegionSelector */}  
                              
                          <div className="form-group">        
                            <label className="form-label">Adresse</label>        
                            <textarea        
                              value={formData.adresse}        
                              onChange={(e) => handleInputChange("adresse", e.target.value)}        
                              className="form-textarea"        
                              rows="3"        
                            />        
                          </div>        
                              
                          <div className="form-group">        
                            <label className="form-label">Statut *</label>        
                            <select        
                              value={formData.statut}        
                              onChange={(e) => handleInputChange("statut", e.target.value)}        
                              className="form-select"        
                              required        
                            >        
                              <option value="ACTIF">Actif</option>        
                              <option value="INACTIF">Inactif</option>        
                              <option value="SUSPENDU">Suspendu</option>        
                              <option value="EN_ATTENTE">En attente</option>        
                            </select>        
                          </div>        
                        </>        
                      )}        
      
                      {/* Champs spécifiques aux entreprises */}        
                      {formData.type === "Entreprise" && (        
                        <>        
                          <div className="form-group">        
                            <label className="form-label">Raison sociale *</label>        
                            <input        
                              type="text"        
                              value={formData.raison_sociale}        
                              onChange={(e) => handleInputChange("raison_sociale", e.target.value)}        
                              className="form-input"        
                              required        
                            />        
                          </div>        
      
                          <div className="form-group">        
                            <label className="form-label">Téléphone *</label>        
                            <input        
                              type="tel"        
                              value={formData.telephone}        
                              onChange={(e) => handleInputChange("telephone", e.target.value)}        
                              className="form-input"        
                              required        
                            />        
                          </div>        
      
                          <div className="form-group">        
                            <label className="form-label">ICE</label>        
                            <input        
                              type="text"        
                              value={formData.ice}        
                              onChange={(e) => handleInputChange("ice", e.target.value)}        
                              className="form-input"        
                            />        
                          </div>        
                                
                          <div className="form-group">        
                            <label className="form-label">Patente</label>        
                            <input        
                              type="text"        
                              value={formData.patente}        
                              onChange={(e) => handleInputChange("patente", e.target.value)}        
                              className="form-input"        
                            />        
                          </div>        
                                
                          <div className="form-group">        
                            <label className="form-label">RC</label>        
                            <input        
                              type="text"        
                              value={formData.rc}        
                              onChange={(e) => handleInputChange("rc", e.target.value)}        
                              className="form-input"        
                            />        
                          </div>        
                                
                          <div className="form-group">        
                            <label className="form-label">Ville RC</label>        
                            <input        
                              type="text"        
                              value={formData.ville_rc}        
                              onChange={(e) => handleInputChange("ville_rc", e.target.value)}        
                              className="form-input"        
                            />        
                          </div>        
                                
                          {/* ✅ SUPPRIMER CityRegionSelector */}  
      
                          <div className="form-group">        
                            <label className="form-label">Statut *</label>        
                            <select        
                              value={formData.statut}        
                              onChange={(e) => handleInputChange("statut", e.target.value)}        
                              className="form-select"        
                              required        
                            >        
                              <option value="ACTIF">Actif</option>        
                              <option value="INACTIF">Inactif</option>        
                              <option value="SUSPENDU">Suspendu</option>        
                              <option value="EN_ATTENTE">En attente</option>        
                            </select>        
                          </div>      
      
                          <div className="form-group">        
                            <label className="form-label">Adresse</label>        
                            <textarea        
                              value={formData.adresse}        
                              onChange={(e) => handleInputChange("adresse", e.target.value)}        
                              className="form-textarea"        
                              rows="3"        
                            />        
                          </div>        
                        </>        
                      )}        
                    </div>              
                    <div className="form-actions">              
                      <button               
                        type="button"              
                        onClick={() => setIsEditDialogOpen(false)}              
                        className="cancel-button"              
                      >              
                        Annuler              
                      </button>              
                      <button               
                        type="submit"              
                        className="submit-button"              
                        disabled={isLoading}              
                      >              
                        {isLoading ? "Modification..." : "Modifier"}              
                      </button>              
                    </div>              
                  </form>              
                </div>              
              </div>              
            )}              
          </div>              
        </div>              
      </div>              
    </div>              
  )              
}