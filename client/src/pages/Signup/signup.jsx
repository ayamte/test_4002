import { useState } from "react"            
import { Eye, EyeOff, User, Building, Mail, Lock, Phone, MapPin, AlertCircle, CheckCircle, Link, Navigation } from "lucide-react"            
import { useNavigate } from "react-router-dom"      
import { authService } from "../../services/authService"          
import "./signup.css"            
// ✅ SUPPRIMER l'import CityRegionSelector  
// import CityRegionSelector from '../../components/common/CityRegionSelector';        
        
const SignupPage = () => {            
  const navigate = useNavigate();      
  const [userType, setUserType] = useState("PHYSIQUE")            
  const [showPassword, setShowPassword] = useState(false)            
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)            
  const [isLoading, setIsLoading] = useState(false)            
  const [error, setError] = useState("")            
  const [success, setSuccess] = useState(false)          
        
  // ✅ SUPPRIMER les états pour les sélecteurs ville/région  
  // const [selectedCity, setSelectedCity] = useState('');        
  // const [selectedRegion, setSelectedRegion] = useState('');         
    
  // ✅ AJOUT: État pour la ville uniquement (Casablanca par défaut)  
  const [selectedCity, setSelectedCity] = useState('');  
  const [cities, setCities] = useState([]);  
  const [loadingCities, setLoadingCities] = useState(false);  
    
  // États pour la géolocalisation    
  const [gpsLocation, setGpsLocation] = useState(null);    
  const [isGettingLocation, setIsGettingLocation] = useState(false);    
  const [locationError, setLocationError] = useState('');    
        
  // PhysicalUser          
  const [physicalData, setPhysicalData] = useState({              
    email: "",              
    password: "",              
    confirmPassword: "",              
    first_name: "",              
    last_name: "",              
    civilite: "M",                 
    telephone_principal: "",              
    adresse_principale: "",              
  })           
          
  // MoralUser        
  const [moralData, setMoralData] = useState({            
    email: "",            
    password: "",            
    confirmPassword: "",            
    raison_sociale: "",            
    ice: "",            
    patente: "",            
    rc: "",            
    ville_rc: "",            
    telephone_principal: "",            
    adresse_principale: "",            
  })            
  
  // ✅ AJOUT: Fonction pour charger les villes  
  const loadCities = async () => {  
    try {  
      setLoadingCities(true);  
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/locations/cities`);  
      if (response.ok) {  
        const data = await response.json();  
        setCities(data.data || []);  
          
        // ✅ Définir Casablanca comme ville par défaut si disponible  
        const casablanca = data.data?.find(city =>   
          city.name?.toLowerCase().includes('casablanca') ||   
          city.nom?.toLowerCase().includes('casablanca')  
        );  
        if (casablanca && !selectedCity) {  
          setSelectedCity(casablanca._id);  
        }  
      }  
    } catch (error) {  
      console.error('Erreur chargement villes:', error);  
    } finally {  
      setLoadingCities(false);  
    }  
  };  
  
  // ✅ Charger les villes au montage du composant  
  useState(() => {  
    loadCities();  
  }, []);  
      
  // ✅ Fonction pour réinitialiser les sélecteurs lors du changement de type      
  const handleUserTypeChange = (type) => {      
    setUserType(type);      
    // ✅ SUPPRIMER la réinitialisation des régions  
    // setSelectedRegion('');    
    // Réinitialiser aussi la géolocalisation    
    setGpsLocation(null);    
    setLocationError('');    
  };      
    
  // Fonction pour obtenir la position GPS    
  const getCurrentLocation = () => {    
    setIsGettingLocation(true);    
    setLocationError('');    
        
    if (!navigator.geolocation) {    
      setLocationError('La géolocalisation n\'est pas supportée par ce navigateur');    
      setIsGettingLocation(false);    
      return;    
    }    
    
    navigator.geolocation.getCurrentPosition(    
      (position) => {    
        const { latitude, longitude } = position.coords;    
        setGpsLocation({ latitude, longitude });    
        setIsGettingLocation(false);    
      },    
      (error) => {    
        let errorMessage = 'Erreur lors de la récupération de la position';    
        switch(error.code) {    
          case error.PERMISSION_DENIED:    
            errorMessage = 'Permission de géolocalisation refusée';    
            break;    
          case error.POSITION_UNAVAILABLE:    
            errorMessage = 'Position non disponible';    
            break;    
          case error.TIMEOUT:    
            errorMessage = 'Délai d\'attente dépassé';    
            break;    
        }    
        setLocationError(errorMessage);    
        setIsGettingLocation(false);    
      },    
      {    
        enableHighAccuracy: true,    
        timeout: 10000,    
        maximumAge: 60000    
      }    
    );    
  };    
          
  const handleSubmit = async (e) => {            
    e.preventDefault()            
    setIsLoading(true)            
    setError("")            
          
    const currentData = userType === "PHYSIQUE" ? physicalData : moralData            
          
    if (currentData.password !== currentData.confirmPassword) {            
      setError("Les mots de passe ne correspondent pas")            
      setIsLoading(false)            
      return            
    }            
          
    if (currentData.password.length < 8) {            
      setError("Le mot de passe doit contenir au moins 8 caractères")            
      setIsLoading(false)            
      return            
    }            
          
    try {            
      const requestData = {            
        email: currentData.email,            
        password: currentData.password,            
        role_code: 'CLIENT',            
        type_personne: userType,            
        profile: userType === 'PHYSIQUE' ? {            
          first_name: currentData.first_name,            
          last_name: currentData.last_name,            
          civilite: currentData.civilite,                      
          telephone_principal: currentData.telephone_principal,            
          adresse_principale: currentData.adresse_principale,            
          city_id: selectedCity,      
          latitude: gpsLocation?.latitude || null,    
          longitude: gpsLocation?.longitude || null    
        } : {            
          raison_sociale: currentData.raison_sociale,            
          ice: currentData.ice,            
          patente: currentData.patente,            
          rc: currentData.rc,            
          ville_rc: currentData.ville_rc,            
          telephone_principal: currentData.telephone_principal,            
          adresse_principale: currentData.adresse_principale,            
          city_id: selectedCity,        
          latitude: gpsLocation?.latitude || null,    
          longitude: gpsLocation?.longitude || null    
        }            
      }            
          
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, {            
        method: "POST",            
        headers: {            
          "Content-Type": "application/json",            
        },            
        body: JSON.stringify(requestData),            
      })            
          
      const data = await response.json()            
          
      if (data.success) {          
        if (data.requiresVerification) {        
          navigate('/verify-email', {         
            state: { email: currentData.email }         
          });        
        } else {        
          if (data.data.token) {        
            authService.setToken(data.data.token);        
            authService.setUser(data.data.user);        
          }        
          setSuccess(true);        
        }        
      } else {          
        throw new Error(data.message)          
      }           
    } catch (err) {            
      setError(err.message || "Une erreur est survenue")            
    } finally {            
      setIsLoading(false)            
    }            
  }            
          
  const handlePhysicalChange = (e) => {            
    setPhysicalData((prev) => ({            
      ...prev,            
      [e.target.name]: e.target.value,            
    }))            
  }            
          
  const handleMoralChange = (e) => {            
    setMoralData((prev) => ({            
      ...prev,            
      [e.target.name]: e.target.value,            
    }))            
  }            
          
  if (success) {            
    return (            
      <div className="signup-container">            
        <div className="signup-background"></div>            
        <div className="signup-content">            
          <div className="signup-card">            
            <div className="success-content">            
              <div className="success-icon">            
                <CheckCircle className="icon" />            
              </div>            
              <h2 className="success-title">Inscription réussie !</h2>            
              <p className="success-text">            
                Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.            
              </p>            
              <button onClick={() => navigate("/login")} className="success-button">            
                Se connecter            
              </button>            
            </div>            
          </div>            
        </div>            
      </div>            
    )            
  }            
          
  return (            
    <div className="signup-container">            
      <div className="signup-background"></div>            
          
      <div className="signup-content">            
        <div className="signup-card">            
          <div className="signup-header">            
            <h1 className="signup-title">Créer un compte</h1>            
            <p className="signup-subtitle">Rejoignez-nous dès aujourd'hui</p>            
          </div>            
          
          <div className="user-type-selection">            
            <button            
              type="button"            
              onClick={() => handleUserTypeChange("PHYSIQUE")}            
              className={`user-type-btn ${userType === "PHYSIQUE" ? "active" : ""}`}            
            >            
              <User className="user-type-icon" />            
              <span>Particulier</span>            
            </button>            
            <button            
              type="button"            
              onClick={() => handleUserTypeChange("MORAL")}            
              className={`user-type-btn ${userType === "MORAL" ? "active" : ""}`}            
            >            
              <Building className="user-type-icon" />            
              <span>Entreprise</span>            
            </button>            
          </div>            
          
          {error && (            
            <div className="error-alert">            
              <AlertCircle className="error-icon" />            
              <span>{error}</span>            
            </div>            
          )}            
          
          <form onSubmit={handleSubmit} className="signup-form">            
            {/* Email et mots de passe */}        
            <div className="form-section">            
              <div className="form-group">            
                <label htmlFor="email" className="form-label">            
                  Email *            
                </label>            
                <div className="input-wrapper">            
                  <Mail className="input-icon" />            
                  <input            
                    id="email"            
                    name="email"            
                    type="email"            
                    placeholder="votre@email.com"            
                    value={userType === "PHYSIQUE" ? physicalData.email : moralData.email}            
                    onChange={userType === "PHYSIQUE" ? handlePhysicalChange : handleMoralChange}            
                    className="form-input"            
                    required            
                  />            
                </div>            
              </div>            
          
              <div className="form-row">            
                <div className="form-group">            
                  <label htmlFor="password" className="form-label">            
                    Mot de passe *            
                  </label>      
                  <div className="input-wrapper">            
                    <Lock className="input-icon" />            
                    <input            
                      id="password"            
                      name="password"            
                      type={showPassword ? "text" : "password"}            
                      placeholder="••••••••"            
                      value={userType === "PHYSIQUE" ? physicalData.password : moralData.password}            
                      onChange={userType === "PHYSIQUE" ? handlePhysicalChange : handleMoralChange}            
                      className="form-input password-input"            
                      required            
                    />            
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">            
                      {showPassword ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}            
                    </button>            
                  </div>            
                </div>            
          
                <div className="form-group">            
                  <label htmlFor="confirmPassword" className="form-label">            
                    Confirmer *            
                  </label>            
                  <div className="input-wrapper">            
                    <Lock className="input-icon" />            
                    <input            
                      id="confirmPassword"            
                      name="confirmPassword"            
                      type={showConfirmPassword ? "text" : "password"}            
                      placeholder="••••••••"            
                      value={userType === "PHYSIQUE" ? physicalData.confirmPassword : moralData.confirmPassword}            
                      onChange={userType === "PHYSIQUE" ? handlePhysicalChange : handleMoralChange}            
                      className="form-input password-input"            
                      required            
                    />            
                    <button            
                      type="button"            
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}            
                      className="password-toggle"            
                    >            
                      {showConfirmPassword ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}            
                    </button>            
                  </div>            
                </div>            
              </div>            
            </div>            
          
            {/* Section particuliers */}          
            {userType === "PHYSIQUE" && (            
              <div className="form-section">            
                <div className="form-row-3">            
                  <div className="form-group">            
                    <label htmlFor="civilite" className="form-label">            
                      Civilité *            
                    </label>            
                    <select            
                      id="civilite"            
                      name="civilite"            
                      value={physicalData.civilite}            
                      onChange={handlePhysicalChange}            
                      className="form-select"            
                    >            
                      <option value="M">M.</option>            
                      <option value="Mme">Mme</option>            
                      <option value="Mlle">Mlle</option>            
                    </select>            
                  </div>            
                  <div className="form-group">            
                    <label htmlFor="first_name" className="form-label">            
                      Prénom *            
                    </label>            
                    <input            
                      id="first_name"            
                      name="first_name"            
                      placeholder="Votre prénom"            
                      value={physicalData.first_name}            
                      onChange={handlePhysicalChange}            
                      className="form-input"            
                      required            
                    />            
                  </div>            
                  <div className="form-group">            
                    <label htmlFor="last_name" className="form-label">            
                      Nom *            
                    </label>            
                    <input            
                      id="last_name"            
                      name="last_name"            
                      placeholder="Votre nom"            
                      value={physicalData.last_name}            
                      onChange={handlePhysicalChange}            
                      className="form-input"            
                      required            
                    />  
                  </div>            
                </div>            
      
                
  
                {/* ✅ REMPLACER CityRegionSelector par un simple sélecteur de ville */}      
                <div className="form-group">  
                  <label htmlFor="city" className="form-label">  
                    Ville *  
                  </label>  
                  <select  
                    id="city"  
                    value={selectedCity}  
                    onChange={(e) => setSelectedCity(e.target.value)}  
                    className="form-select"  
                    required  
                    disabled={loadingCities}  
                  >  
                    <option value="">  
                      {loadingCities ? 'Chargement des villes...' : 'Sélectionner une ville'}  
                    </option>  
                    {cities.map(city => (  
                      <option key={city._id} value={city._id}>  
                        {city.nom || city.name}  
                      </option>  
                    ))}  
                  </select>  
                </div>  
              </div>              
            )}              
            
            {/* Section entreprises */}            
            {userType === "MORAL" && (              
              <div className="form-section">              
                <div className="form-group">              
                  <label htmlFor="raison_sociale" className="form-label">              
                    Raison sociale *              
                  </label>              
                  <input              
                    id="raison_sociale"              
                    name="raison_sociale"              
                    placeholder="Nom de l'entreprise"              
                    value={moralData.raison_sociale}              
                    onChange={handleMoralChange}              
                    className="form-input"              
                    required              
                  />              
                </div>              
            
                <div className="form-row">              
                  <div className="form-group">              
                    <label htmlFor="ice" className="form-label">              
                      ICE              
                    </label>              
                    <input              
                      id="ice"              
                      name="ice"              
                      placeholder="Numéro ICE"              
                      value={moralData.ice}              
                      onChange={handleMoralChange}              
                      className="form-input"              
                    />              
                  </div>              
                  <div className="form-group">              
                    <label htmlFor="rc" className="form-label">              
                      RC                
                    </label>                
                    <input                
                      id="rc"                
                      name="rc"                
                      placeholder="Registre de commerce"                
                      value={moralData.rc}                
                      onChange={handleMoralChange}                
                      className="form-input"                
                    />                
                  </div>                
                </div>                
                
                <div className="form-row">                
                  <div className="form-group">                
                    <label htmlFor="patente" className="form-label">                
                      Patente                
                    </label>                
                    <input                
                      id="patente"                
                      name="patente"                
                      placeholder="Numéro de patente"                
                      value={moralData.patente}                
                      onChange={handleMoralChange}                
                      className="form-input"                
                    />                
                  </div>                
                  <div className="form-group">                
                    <label htmlFor="ville_rc" className="form-label">                
                      Ville RC                
                    </label>                
                    <input                
                      id="ville_rc"                
                      name="ville_rc"                
                      placeholder="Ville du registre de commerce"                
                      value={moralData.ville_rc}                
                      onChange={handleMoralChange}                
                      className="form-input"                
                    />                
                  </div>                
                </div>      
  
                {/* ✅ REMPLACER CityRegionSelector par un simple sélecteur de ville pour les entreprises aussi */}      
                <div className="form-group">  
                  <label htmlFor="city" className="form-label">  
                    Ville *  
                  </label>  
                  <select  
                    id="city"  
                    value={selectedCity}  
                    onChange={(e) => setSelectedCity(e.target.value)}  
                    className="form-select"  
                    required  
                    disabled={loadingCities}  
                  >  
                    <option value="">  
                      {loadingCities ? 'Chargement des villes...' : 'Sélectionner une ville'}  
                    </option>  
                    {cities.map(city => (  
                      <option key={city._id} value={city._id}>  
                        {city.nom || city.name}  
                      </option>  
                    ))}  
                  </select>  
                </div>  
              </div>                
            )}                
                
            {/* Contact Information */}                
            <div className="form-section">                
              <div className="form-group">                
                <label htmlFor="telephone_principal" className="form-label">                
                  Téléphone principal *                
                </label>                
                <div className="input-wrapper">                
                  <Phone className="input-icon" />                
                  <input                
                    id="telephone_principal"                
                    name="telephone_principal"                
                    placeholder="+212 6XX XXX XXX"                
                    value={userType === "PHYSIQUE" ? physicalData.telephone_principal : moralData.telephone_principal}                
                    onChange={userType === "PHYSIQUE" ? handlePhysicalChange : handleMoralChange}                
                    className="form-input"                
                    required                
                  />                
                </div>                
              </div>                
                
              <div className="form-group">                
                <label htmlFor="adresse_principale" className="form-label">                
                  Adresse principale                
                </label>                
                <div className="input-wrapper">                
                  <MapPin className="input-icon textarea-icon" />                
                  <textarea                
                    id="adresse_principale"                
                    name="adresse_principale"                
                    placeholder="Votre adresse complète"                
                    value={userType === "PHYSIQUE" ? physicalData.adresse_principale : moralData.adresse_principale}                
                    onChange={userType === "PHYSIQUE" ? handlePhysicalChange : handleMoralChange}                
                    className="form-textarea"                
                    rows="3"                
                  />                
                </div>                
              </div>                
            </div>                
    
            {/* Section Géolocalisation */}    
            <div className="form-section">    
              <h3 className="form-section-title">Position géographique (optionnel)</h3>    
              <p className="form-section-description">    
                Permettez-nous de localiser votre adresse pour améliorer nos services de livraison    
              </p>    
                  
              <div className="geolocation-section">    
                <button    
                  type="button"    
                  onClick={getCurrentLocation}    
                  disabled={isGettingLocation}    
                  className={`geolocation-button ${isGettingLocation ? 'loading' : ''}`}    
                >    
                  {isGettingLocation ? (    
                    <>    
                      <div className="spinner"></div>    
                      Récupération de la position...    
                    </>    
                  ) : (    
                    <>    
                      <Navigation className="button-icon" />    
                      Obtenir ma position actuelle    
                    </>    
                  )}    
                </button>    
                    
                {gpsLocation && (    
                  <div className="location-success">    
                    <CheckCircle className="success-icon" />    
                    <span>Position capturée avec succès</span>    
                    <small>    
                      Lat: {gpsLocation.latitude.toFixed(6)},     
                      Lng: {gpsLocation.longitude.toFixed(6)}    
                    </small>    
                  </div>    
                )}    
                    
                {locationError && (    
                  <div className="location-error">    
                    <AlertCircle className="error-icon" />    
                    <span>{locationError}</span>    
                  </div>    
                )}    
              </div>    
            </div>    
                
            {/* Terms */}                
            <div className="terms-group">                
              <label className="checkbox-label">                
                <input type="checkbox" className="checkbox" required />                
                <span className="checkbox-text">                
                  J'accepte les{" "}                
                  <a href="/terms" className="terms-link">                
                    conditions d'utilisation                
                  </a>{" "}                
                  et la{" "}                
                  <a href="/privacy" className="terms-link">                
                    politique de confidentialité                
                  </a>                
                </span>                
              </label>                
            </div>                
                
            <button type="submit" className={`signup-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>                
              {isLoading ? "Création du compte..." : "Créer mon compte"}                
            </button>                
          </form>                
                
          {/* Footer */}                
          <div className="signup-footer">                
            <p>                
              Déjà un compte ?{" "}                
              <Link to="/login" className="login-link">                
                Se connecter                
              </Link>           
            </p>                
          </div>                
        </div>                
      </div>                
    </div>                
  )                
}                
                
export default SignupPage;