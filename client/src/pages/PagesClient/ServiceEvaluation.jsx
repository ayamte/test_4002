import React, { useState } from 'react';
import { Star, CheckCircle, Send, MessageSquare, Clock, Shield, Zap, Smartphone } from 'lucide-react';
import DriverInfo from '../../components/client/ServiceEvaluationPage/DriverInfo';
import StarRating from '../../components/client/ServiceEvaluationPage/StarRating';
import Title from '../../components/client/ServiceEvaluationPage/Title';
import './ServiceEvaluation.css'; 


const ServiceEvaluation = () => {
    const [rapidite, setRapidite] = useState(0);
    const [professionalisme, setProfessionalisme] = useState(0);
    const [securite, setSecurite] = useState(0);
    const [facilite, setFacilite] = useState(0);
    const [commentaire, setCommentaire] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
  
    // Données du livreur et de la commande
    const deliveryInfo = {
      driver: "Ahmed Benali",
      driverPhone: "+212 6 12 34 56 78",
      orderId: "GAZ-2024-001234"
    };
  
    const evaluationCriteria = [
      {
        label: "Rapidité de livraison",
        icon: Clock,
        rating: rapidite,
        setRating: setRapidite
      },
      {
        label: "Professionnalisme du livreur",
        icon: Star,
        rating: professionalisme,
        setRating: setProfessionalisme
      },
      {
        label: "Sécurité et qualité",
        icon: Shield,
        rating: securite,
        setRating: setSecurite
      },
      {
        label: "Facilité d'utilisation de l'app",
        icon: Smartphone,
        rating: facilite,
        setRating: setFacilite
      }
    ];
  
    const handleSubmit = () => {
      if (rapidite === 0 || professionalisme === 0 || securite === 0 || facilite === 0) {
        alert('Veuillez évaluer tous les critères avant d\'envoyer.');
        return;
      }
      
      setIsSubmitted(true);
    };
  
    const calculateAverageRating = () => {
      return ((rapidite + professionalisme + securite + facilite) / 4).toFixed(1);
    };
  
    if (isSubmitted) {
      return (
        <div className="min-h-screen bg-gray-50">
          <Title />
  
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Merci pour votre évaluation !</h2>
              <p className="text-gray-600 mb-4">
                Votre avis nous aide à améliorer nos services.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-600">Note moyenne attribuée</p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className="text-3xl font-bold" style={{color: '#1F55A3'}}>
                    {calculateAverageRating()}
                  </span>
                  <Star size={32} className="text-yellow-400 fill-current" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  
    return (
            <div className="service-wrapper">  
        <div className="service-container">  
          <div className="service-content">  
            <div className="service-page-content"> 
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 shadow-lg" style={{background: 'linear-gradient(135deg, #1F55A3 0%, #245FA6 100%)'}}>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold">Évaluation du service</h1>
            <p className="text-lg opacity-90 mt-2">Votre avis compte pour nous</p>
          </div>
        </div>
  
        <div className="max-w-4xl mx-auto p-6">
          {/* Information du livreur */}
          <DriverInfo 
            driver={deliveryInfo.driver}
            driverPhone={deliveryInfo.driverPhone}
            orderId={deliveryInfo.orderId}
          />
  
          {/* Critères d'évaluation */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-6" style={{color: '#1F55A3'}}>
              Évaluez votre expérience
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {evaluationCriteria.map((criteria, index) => (
                <StarRating
                  key={index}
                  label={criteria.label}
                  icon={criteria.icon}
                  rating={criteria.rating}
                  setRating={criteria.setRating}
                />
              ))}
            </div>
          </div>
  
          {/* Commentaire optionnel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <MessageSquare size={20} style={{color: '#4DAEBD'}} />
              <h3 className="text-lg font-semibold" style={{color: '#1F55A3'}}>
                Commentaire (optionnel)
              </h3>
            </div>
            
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Partagez votre expérience ou suggérez des améliorations..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="4"
            />
            
            <div className="text-right mt-2">
              <span className="text-sm text-gray-500">
                {commentaire.length}/500 caractères
              </span>
            </div>
          </div>
  
          {/* Résumé et bouton d'envoi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold" style={{color: '#1F55A3'}}>
                  Résumé de votre évaluation
                </h3>
                {(rapidite > 0 || professionalisme > 0 || securite > 0 || facilite > 0) && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-gray-600">Note moyenne:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xl font-bold" style={{color: '#1F55A3'}}>
                        {calculateAverageRating()}
                      </span>
                      <Star size={20} className="text-yellow-400 fill-current" />
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-all flex items-center space-x-2 shadow-md"
                style={{backgroundColor: '#4DAEBD'}}
              >
                <Send size={20} />
                <span>Envoyer l'évaluation</span>
              </button>
            </div>
          </div>          
        </div>
      </div>
             </div>  
      </div>  
    </div>  
  </div> 
    );
  };
  
  export default ServiceEvaluation;
  