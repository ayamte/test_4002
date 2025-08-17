import { useState, useEffect } from "react"        
import {         
  MdSearch as Search,         
  MdAdd as Plus,         
  MdEdit as Edit,        
  MdDelete as Delete,        
  MdClose as X        
} from "react-icons/md"        
import "./gestionClient.css"       
import { authService } from '../../../services/authService'  
  
export default function EntrepriseClientManagement() {      
  const [searchTerm, setSearchTerm] = useState("")      
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)      
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)      
  const [clients, setClients] = useState([])      
  const [editingClient, setEditingClient] = useState(null)      
  const [loading, setLoading] = useState(true)    
  const [error, setError] = useState("")    
  const [isLoading, setIsLoading] = useState(false)    
    
  // Formulaire simplifié pour clients particuliers seulement  
  const [formData, setFormData] = useState({      
    email: "",  
    telephone: "",  
    adresse: "",  
    prenom: "",  
    nom: "",  
    civilite: "M",  
  })      
    
  // ✅ Fonction pour recharger les clients après modification
  const reloadClients = async () => {
    try {
      const user = authService.getUser();
      if (!user || user.role !== 'CLIENT') return;

      const token = authService.getToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/customers/company/${user.moral_user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        authService.logout();
        return;
      }

      const data = await response.json();
      if (data.success) {
        const companyClients = data.data
          .filter(customer => {
            return customer.type_client === 'PHYSIQUE' &&
                   customer.physical_user_id?.moral_user_id &&
                   customer.physical_user_id.moral_user_id.toString() === user.moral_user_id;
          })
          .map(customer => ({
            id: customer._id,
            nom: `${customer.physical_user_id.first_name} ${customer.physical_user_id.last_name}`,
            type: 'Particulier',
            telephone: customer.physical_user_id?.telephone_principal || 'N/A',
            email: customer.physical_user_id?.user_id?.email || 'N/A',
            adresse: 'Voir adresses sauvegardées',
            statut: customer.statut,
            customer_code: customer.customer_code,
            civilite: customer.physical_user_id?.civilite || '',
            prenom: customer.physical_user_id?.first_name || '',
            nom_famille: customer.physical_user_id?.last_name || ''
          }));
        setClients(companyClients);
      }
    } catch (err) {
      console.error('Erreur lors du rechargement:', err);
    }
  };

  // Charger les clients de l'entreprise connectée  
  useEffect(() => {    
    const fetchCompanyClients = async () => {    
      try {    
        setLoading(true);  
        const user = authService.getUser();  
          
        if (!user || user.role !== 'CLIENT') {  
          setError("Accès non autorisé");  
          return;  
        }  
  
        // Récupérer tous les clients et filtrer ceux liés à cette entreprise  
        const token = authService.getToken();  
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/customers/company/${user.moral_user_id}`, {  
            headers: {  
              'Authorization': `Bearer ${token}`,  
              'Content-Type': 'application/json'  
            }  
          });
          
        if (response.status === 401) {  
          authService.logout();  
          setError("Session expirée");  
          return;  
        }  
          
        const data = await response.json();  
            
        if (data.success) {    
          // FILTRER: Seulement les particuliers liés à cette entreprise  
          const companyClients = data.data  
            .filter(customer => {  
              // Garder seulement les particuliers qui ont un moral_user_id correspondant à l'entreprise connectée  
              return customer.type_client === 'PHYSIQUE' &&   
                     customer.physical_user_id?.moral_user_id &&   
                     customer.physical_user_id.moral_user_id.toString() === user.moral_user_id;  
            })  
            .map(customer => ({    
              id: customer._id,    
              nom: `${customer.physical_user_id.first_name} ${customer.physical_user_id.last_name}`,    
              type: 'Particulier', // Toujours particulier pour les entreprises  
              telephone: customer.physical_user_id?.telephone_principal || 'N/A',    
              email: customer.physical_user_id?.user_id?.email || 'N/A',    
              adresse: 'Voir adresses sauvegardées',  
              statut: customer.statut,    
              customer_code: customer.customer_code,  
              civilite: customer.physical_user_id?.civilite || '',  
              prenom: customer.physical_user_id?.first_name || '',  
              nom_famille: customer.physical_user_id?.last_name || ''  
            }));    
          setClients(companyClients);    
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
    
    fetchCompanyClients();    
  }, []);    
      
  // Filtrer les clients selon le terme de recherche      
  const filteredClients = clients.filter(      
    (client) =>      
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||      
      client.email.toLowerCase().includes(searchTerm.toLowerCase())      
  )      
      
  // Calculer les statistiques (seulement particuliers)  
  const totalClients = clients.length      
      
  const handleInputChange = (field, value) => {      
    setFormData((prev) => ({      
      ...prev,      
      [field]: value,      
    }))      
  }      

  // ✅ Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      email: "",
      telephone: "",
      adresse: "",
      prenom: "",
      nom: "",
      civilite: "M",
    });
  };
      
  // ✅ handleAddSubmit corrigé - suppression de inherit_company_address
  const handleAddSubmit = async (e) => {      
    e.preventDefault()      
    setIsLoading(true)    
    setError("")    
    
    try {    
      const user = authService.getUser();  
        
      // Créer un client particulier lié à cette entreprise  
      const clientData = {  
        type_client: 'PHYSIQUE',  
        profile: {  
          first_name: formData.prenom,  
          last_name: formData.nom,  
          civilite: formData.civilite,  
          telephone_principal: formData.telephone,  
          email: formData.email,  
          adresse_principale: formData.adresse,  
          moral_user_id: user.moral_user_id // Lier à l'entreprise connectée  
          // ✅ SUPPRIMER inherit_company_address car plus nécessaire dans la nouvelle architecture
        }  
      };     
  
      const token = authService.getToken();  
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/customers/company`, {  
        method: 'POST',  
        headers: {  
          'Authorization': `Bearer ${token}`,  
          'Content-Type': 'application/json'  
        },  
        body: JSON.stringify(clientData)  
      });
          
      if (response.status === 401) {  
        authService.logout();  
        setError("Session expirée");  
        return;  
      }  
        
      const result = await response.json();  
          
      if (result.success) {    
        // ✅ Utiliser reloadClients au lieu de window.location.reload()
        await reloadClients();
        setIsAddDialogOpen(false);
        resetForm();
      } else {    
        setError(result.message || "Erreur lors de l'ajout du client");    
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
      
  const handleEditSubmit = async (e) => {      
    e.preventDefault()      
    setIsLoading(true)    
    setError("")    
    
    try {      
      const clientData = {    
        type_client: 'PHYSIQUE',    
        profile: {    
          first_name: formData.prenom,    
          last_name: formData.nom,    
          civilite: formData.civilite,  
          telephone_principal: formData.telephone,    
          email: formData.email,    
          adresse_principale: formData.adresse  
        }    
      };    
  
      const token = authService.getToken();  
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/customers/${editingClient.id}`, {  
        method: 'PUT',  
        headers: {  
          'Authorization': `Bearer ${token}`,  
          'Content-Type': 'application/json'  
        },  
        body: JSON.stringify(clientData)  
      });  
          
      if (response.status === 401) {  
        authService.logout();  
        setError("Session expirée");  
        return;  
      }  
        
      const result = await response.json();  
          
      if (result.success) {    
        // ✅ Utiliser reloadClients au lieu de window.location.reload()
        await reloadClients();
        setIsEditDialogOpen(false);
        setEditingClient(null);
        resetForm();
      } else {    
        setError(result.message || "Erreur lors de la modification du client");    
      }    
    } catch (err) {    
      setError("Erreur lors de la modification du client");    
      console.error('Erreur:', err);    
    } finally {    
      setIsLoading(false);    
    }    
  }      
      
  const handleEdit = (client) => {      
    setEditingClient(client)      
    setFormData({      
      email: client.email,  
      telephone: client.telephone,  
      adresse: client.adresse,  
      prenom: client.prenom,  
      nom: client.nom_famille,  
      civilite: client.civilite,  
    })      
    setIsEditDialogOpen(true)      
  }      
      
  const handleDelete = async (clientId) => {      
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {      
      try {    
        setError("");    
        const token = authService.getToken();  
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/customers/${clientId}`, {  
          method: 'DELETE',  
          headers: {  
            'Authorization': `Bearer ${token}`,  
            'Content-Type': 'application/json'  
          }  
        });  
            
        if (response.status === 401) {  
          authService.logout();  
          setError("Session expirée");  
          return;  
        }  
          
        const result = await response.json();  
            
        if (result.success) {    
          setClients(clients.filter(client => client.id !== clientId));    
        } else {    
          setError(result.message || "Erreur lors de la suppression du client");    
        }    
      } catch (err) {    
        setError("Erreur lors de la suppression du client");    
        console.error('Erreur:', err);    
      }    
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
              <p className="page-subtitle">Gérez vos clients particuliers</p>      
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
      
            {/* Statistique simplifiée */}      
            <div className="stats-grid">      
              <div className="stat-card gradient-card">      
                <div className="stat-card-header">      
                  <div className="stat-content">      
                    <h3 className="stat-label">Total Clients</h3>        
                    <div className="stat-value">{totalClients}</div>        
                    <p className="stat-description">Clients particuliers</p>        
                  </div>        
                </div>        
              </div>        
            </div>          
          
            {/* Bouton Ajouter Client */}          
            <div className="action-section">          
              <button className="add-button" onClick={handleAddClick}>          
                <Plus className="button-icon" />          
                Ajouter Client Particulier          
              </button>          
            </div>          
          
            {/* Barre de recherche */}          
            <div className="search-section">          
              <div className="search-container">          
                <Search className="search-icon" />          
                <input          
                  type="text"          
                  placeholder="Rechercher par nom ou email..."          
                  value={searchTerm}          
                  onChange={(e) => setSearchTerm(e.target.value)}          
                  className="search-input"          
                />          
              </div>          
            </div>          
          
            {/* Tableau simplifié */}          
            <div className="table-card">          
              <div className="table-header">          
                <h3 className="table-title">Liste des Clients Particuliers</h3>          
              </div>          
              <div className="table-content">          
                <div className="table-container">          
                  <table className="clients-table">          
                    <thead>          
                      <tr>          
                        <th>Nom</th>          
                        <th>Téléphone</th>          
                        <th>Email</th>          
                        <th>Actions</th>          
                      </tr>          
                    </thead>          
                    <tbody>          
                      {filteredClients.map((client) => (          
                        <tr key={client.id}>          
                          <td className="font-medium">{client.nom}</td>          
                          <td>{client.telephone}</td>          
                          <td>{client.email}</td>          
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
          
            {/* Modal d'ajout - Formulaire simplifié pour particuliers seulement */}          
            {isAddDialogOpen && (          
              <div className="modal-overlay" onClick={() => setIsAddDialogOpen(false)}>          
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>          
                  <div className="modal-header">          
                    <h3 className="modal-title">Ajouter un Client Particulier</h3>          
                    <button           
                      className="modal-close"          
                      onClick={() => setIsAddDialogOpen(false)}          
                    >          
                      <X className="close-icon" />          
                    </button>          
                  </div>          
                  <form onSubmit={handleAddSubmit} className="modal-form">          
                    <div className="form-grid">          
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
                        <label className="form-label">Adresse</label>          
                        <textarea          
                          value={formData.adresse}          
                          onChange={(e) => handleInputChange("adresse", e.target.value)}          
                          className="form-textarea"          
                          rows="3"          
                        />          
                      </div>          
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
          
            {/* Modal de modification */}          
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
                        <label className="form-label">Adresse</label>          
                        <textarea          
                          value={formData.adresse}          
                          onChange={(e) => handleInputChange("adresse", e.target.value)}          
                          className="form-textarea"          
                          rows="3"          
                        />          
                      </div>          
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
