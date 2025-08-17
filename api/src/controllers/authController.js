const mongoose = require('mongoose');        
const jwt = require('jsonwebtoken');        
const User = require('../models/User');        
const Role = require('../models/Role');        
const PhysicalUser = require('../models/PhysicalUser');        
const MoralUser = require('../models/MoralUser');        
const Customer = require('../models/Customer');        
const Employe = require('../models/Employe');        
const { hashPassword, comparePassword } = require('../utils/password');        
const { generateCustomerCode } = require('../utils/customerCode');      
const crypto = require('crypto');  
const { sendVerificationEmail } = require('../services/emailService');  
const Address = require('../models/Address');  
const UserAddress = require('../models/UserAddress');
const City = require('../models/City'); // ✅ AJOUTER pour Casablanca par défaut

const register = async (req, res) => {        
  try {        
    const {         
      email,         
      password,         
      role_code,         
      type_personne,         
      profile         
    } = req.body;        
      
    // Validation des données requises        
    if (!email || !password || !role_code || !type_personne) {        
      return res.status(400).json({        
        success: false,        
        message: 'Email, mot de passe, rôle et type de personne sont requis'        
      });        
    }        
      
    // ✅ SUPPRIMER toutes les validations de région et ville
    
    // Validation des coordonnées GPS (si fournies)
    if (profile?.latitude && (profile.latitude < -90 || profile.latitude > 90)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude invalide (doit être entre -90 et 90)'
      });
    }

    if (profile?.longitude && (profile.longitude < -180 || profile.longitude > 180)) {
      return res.status(400).json({
        success: false,
        message: 'Longitude invalide (doit être entre -180 et 180)'
      });
    }

    if (role_code === 'CLIENT' && !profile?.city_id) {    
      return res.status(400).json({    
        success: false,    
        message: 'La sélection d\'une ville est requise'    
      });    
    }
      
    // Vérifier si l'utilisateur existe déjà        
    const existingUser = await User.findOne({ email });        
    if (existingUser) {        
      return res.status(400).json({        
        success: false,        
        message: 'Un utilisateur avec cet email existe déjà'        
      });        
    }        
      
    // Trouver le rôle        
    const role = await Role.findOne({ code: role_code });        
    if (!role) {        
      return res.status(400).json({        
        success: false,        
        message: 'Rôle invalide'        
      });        
    }        
      
    // Hacher le mot de passe        
    const password_hash = await hashPassword(password);        
      
    // Créer l'utilisateur principal 
    const newUser = new User({    
      email,    
      password_hash,    
      role_id: role._id,    
      statut: (role_code === 'ADMIN' || role_code === 'EMPLOYE' || role_code === 'EMPLOYE_MAGASIN') ? 'ACTIF' : 'EN_ATTENTE',  
      email_verified: (role_code === 'ADMIN' || role_code === 'EMPLOYE' || role_code === 'EMPLOYE_MAGASIN') ? true : false  
    });        
    
    // Générer un code de vérification
    if (role_code === 'CLIENT') {  
      const verificationCode = crypto.randomInt(100000, 999999).toString();    
      const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);  
      
      newUser.verification_code = verificationCode;    
      newUser.verification_code_expires = verificationExpires;   
      
      await newUser.save();  
        
      // Envoyer l'email de vérification seulement aux clients  
      await sendVerificationEmail(email, verificationCode);  
    } else {  
      // Pour admin et employés, sauvegarder directement sans code de vérification  
      await newUser.save();  
    }
      
    let responseData = {        
      user: {        
        id: newUser._id,        
        email: newUser.email,        
        role: role.code        
      }        
    };        
      
    // Créer selon le type de personne        
    if (type_personne === 'PHYSIQUE') {        
      // Validation pour personne physique        
      if (!profile?.first_name || !profile?.last_name || !profile?.civilite) {        
        throw new Error('Prénom, nom et civilité sont requis pour une personne physique');        
      }        
      
      const physicalUser = new PhysicalUser({  
        user_id: newUser._id,  
        first_name: profile.first_name,  
        last_name: profile.last_name,  
        civilite: profile.civilite,  
        telephone_principal: profile.telephone_principal
      });        
      await physicalUser.save();       
      
      // Créer l'adresse principale
      if (profile.adresse_principale) {  
        
        const newAddress = new Address({  
          user_id: newUser._id,
          street: profile.adresse_principale,  
          city_id: profile.city_id,
          latitude: profile.latitude || null,
          longitude: profile.longitude || null,
          type_adresse: 'DOMICILE',  
          is_principal: true  
        });  
        const savedAddress = await newAddress.save();  
        
        const userAddress = new UserAddress({  
          physical_user_id: physicalUser._id,  
          address_id: savedAddress._id,  
          is_principal: true  
        });  
        await userAddress.save();  
      }
      
      responseData.physical_user = physicalUser;        
      
      // Créer selon le rôle        
      if (role_code === 'CLIENT') {        
        const customer_code = await generateCustomerCode('PHYSIQUE');        
        const customer = new Customer({        
          customer_code,        
          type_client: 'PHYSIQUE',        
          physical_user_id: physicalUser._id,
          statut: 'EN_ATTENTE'      
        });        
        await customer.save();        
        responseData.customer = customer;        
      } else if (role_code === 'EMPLOYE') {        
        if (!profile?.fonction || !profile?.date_embauche) {        
          throw new Error('Fonction et date d\'embauche sont requises pour un employé');        
        }        
            
        // Validation CIN et CNSS obligatoires pour employés    
        if (!profile?.cin || !profile?.cnss) {    
          throw new Error('CIN et CNSS sont obligatoires pour un employé');    
        }    
      
        // Déterminer le rôle selon la fonction      
        let finalRoleCode = 'EMPLOYE';        
        if (profile.fonction === 'MAGASINIER') {        
          finalRoleCode = 'EMPLOYE_MAGASIN';        
        }      
              
        // Vérifier que le rôle final existe      
        const finalRole = await Role.findOne({ code: finalRoleCode });      
        if (!finalRole) {      
          throw new Error(`Rôle ${finalRoleCode} non trouvé`);      
        }      
              
        // Mettre à jour le rôle de l'utilisateur si nécessaire      
        if (finalRoleCode !== role_code) {      
          await User.findByIdAndUpdate(newUser._id, { role_id: finalRole._id });      
          responseData.user.role = finalRoleCode;      
        }      
                
        const employeCount = await Employe.countDocuments();        
        const matricule = `EMP${(employeCount + 1).toString().padStart(6, '0')}`;        
                
        const employe = new Employe({        
          physical_user_id: physicalUser._id,        
          matricule,        
          cin: profile.cin,    
          cnss: profile.cnss,    
          fonction: profile.fonction,        
          date_embauche: profile.date_embauche,        
          salaire_base: profile.salaire_base      
        });        
        await employe.save();        
        responseData.employe = employe;        
      }        
    } else if (type_personne === 'MORAL') {        
      // Validation pour personne morale        
      if (!profile?.raison_sociale) {        
        throw new Error('Raison sociale est requise pour une entreprise');        
      }        
      
      const moralUser = new MoralUser({        
        user_id: newUser._id,        
        raison_sociale: profile.raison_sociale,        
        ice: profile.ice,        
        patente: profile.patente,        
        rc: profile.rc,        
        ville_rc: profile.ville_rc,        
        telephone_principal: profile.telephone_principal
      });        
      await moralUser.save();        
      
      // Créer l'adresse principale
      if (profile.adresse_principale) {  
        
        const newAddress = new Address({  
          user_id: newUser._id,
          street: profile.adresse_principale,  
          city_id: profile.city_id,
          latitude: profile.latitude || null,
          longitude: profile.longitude || null,
          type_adresse: 'SIÈGE SOCIAL',  
          is_principal: true  
        });  
        const savedAddress = await newAddress.save();  
        
        const userAddress = new UserAddress({  
          moral_user_id: moralUser._id,  
          address_id: savedAddress._id,  
          is_principal: true  
        });  
        await userAddress.save();  
      }

      responseData.moral_user = moralUser;        
      
      // Seules les entreprises peuvent être clients        
      if (role_code === 'CLIENT') {        
        const customer_code = await generateCustomerCode('MORAL');        
        const customer = new Customer({        
          customer_code,        
          type_client: 'MORAL',        
          moral_user_id: moralUser._id,
          statut: 'EN_ATTENTE' 
        });        
        await customer.save();        
        responseData.customer = customer;        
      }        
    }        
      
    res.status(201).json({          
      success: true,          
      message: (role_code === 'CLIENT') ?   
        'Compte créé avec succès. Vérifiez votre email pour l\'activer.' :   
        'Utilisateur créé avec succès',  
      requiresVerification: (role_code === 'CLIENT'),  
      email: (role_code === 'CLIENT') ? email : undefined,  
      data: responseData          
    });
       
  } catch (error) {        
    console.error('Erreur lors de l\'inscription:', error);        
            
    // Gestion spécifique des erreurs de duplication        
    if (error.code === 11000) {        
      const field = Object.keys(error.keyPattern)[0];        
      return res.status(400).json({        
        success: false,        
        message: `Ce ${field} est déjà utilisé par un autre utilisateur`,        
        error: `Duplicate ${field}`        
      });        
    }        
            
    res.status(500).json({        
      success: false,        
      message: 'Erreur interne du serveur',        
      error: error.message
    });        
  }        
};        

const login = async (req, res) => {        
  try {        
    const { email, password } = req.body;        
      
    // Validation des données requises        
    if (!email || !password) {        
      return res.status(400).json({        
        success: false,        
        message: 'Email et mot de passe sont requis'        
      });        
    }        
      
    // Trouver l'utilisateur avec son rôle        
    const user = await User.findOne({ email })        
      .populate('role_id', 'code nom');        
      
    if (!user) {        
      return res.status(401).json({        
        success: false,        
        message: 'Email ou mot de passe incorrect'        
      });        
    }        

    // Vérifier le statut de l'utilisateur AVANT la vérification du mot de passe
    if (user.statut === 'EN_ATTENTE') {
      return res.status(401).json({
        success: false,
        message: 'Compte en attente de vérification. Vérifiez votre email.',
        requiresVerification: true,
        email: user.email
      });
    }

    if (user.statut !== 'ACTIF') {
      return res.status(401).json({
        success: false,
        message: 'Compte non activé ou suspendu'
      });
    }
      
    // Vérifier le mot de passe        
    const isPasswordValid = await comparePassword(password, user.password_hash);        
    if (!isPasswordValid) {        
      return res.status(401).json({        
        success: false,        
        message: 'Email ou mot de passe incorrect'        
      });        
    }        

    const requiresPasswordChange = (user.password_temporary || user.first_login) &&   
                              (user.role_id.code === 'EMPLOYE' || user.role_id.code === 'EMPLOYE_MAGASIN');  
    
    // Récupérer les informations utilisateur    
    const physicalUser = await PhysicalUser.findOne({ user_id: user._id });      
    const moralUser = await MoralUser.findOne({ user_id: user._id });      
        
    // Vérification du statut selon le rôle    
    if (user.role_id.code === 'CLIENT') {      
      const customer = await Customer.findOne({      
        $or: [{ physical_user_id: physicalUser?._id }, { moral_user_id: moralUser?._id }]      
      });      
      if (customer && customer.statut !== 'ACTIF') {      
        return res.status(401).json({        
          success: false,        
          message: 'Compte client suspendu'        
        });        
      }        
    } else if (user.role_id.code === 'EMPLOYE' || user.role_id.code === 'EMPLOYE_MAGASIN') {        
      const employe = await Employe.findOne({ physical_user_id: physicalUser._id });        
      if (employe && employe.statut !== 'ACTIF') {        
        return res.status(401).json({        
          success: false,        
          message: 'Employé indisponible'        
        });        
      }        
    }      
        
    // Déterminer le type d'utilisateur et informations additionnelles        
    let userType = null;        
    let additionalInfo = {};        
        
    if (physicalUser) {        
      userType = 'PHYSIQUE';        
      additionalInfo = {        
        first_name: physicalUser.first_name,        
        last_name: physicalUser.last_name,        
        physical_user_id: physicalUser._id        
      };        
    }        
        
    if (moralUser) {        
      userType = 'MORAL';        
      additionalInfo = {        
        raison_sociale: moralUser.raison_sociale,        
        moral_user_id: moralUser._id        
      };        
    }        
          
    // Générer le token JWT            
    const token = jwt.sign(            
      {             
        userId: user._id,             
        email: user.email,             
        role: user.role_id.code             
      },            
      process.env.JWT_SECRET,            
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }            
    );            
          
    // Mettre à jour la dernière connexion            
    await User.findByIdAndUpdate(user._id, {             
      last_login: new Date()             
    });            
        
    res.json({              
      success: true,              
      message: 'Connexion réussie',              
      data: {              
        token,              
        user: {              
          id: user._id,              
          email: user.email,              
          role: user.role_id.code,              
          statut: user.statut,          
          type: userType,        
          requiresPasswordChange,      
          ...additionalInfo        
        }              
      }              
    });              
            
  } catch (error) {              
    console.error('Erreur lors de la connexion:', error);              
    res.status(500).json({              
      success: false,              
      message: 'Erreur interne du serveur',              
      error: error.message              
    });              
  }              
};         
    
const completeProfile = async (req, res) => {        
  try {        
    const userId = req.user._id;        
    const { type_personne, profile } = req.body;        
        
    // Validation des données requises        
    if (!type_personne || !profile) {        
      return res.status(400).json({        
        success: false,        
        message: 'Type de personne et profil sont requis'        
      });        
    }        
      
    // ✅ SUPPRIMER toutes les validations de région et ville  
      
    // Validation des coordonnées GPS (si fournies)    
    if (profile?.latitude && (profile.latitude < -90 || profile.latitude > 90)) {    
      return res.status(400).json({    
        success: false,    
        message: 'Latitude invalide (doit être entre -90 et 90)'    
      });    
    }    
    
    if (profile?.longitude && (profile.longitude < -180 || profile.longitude > 180)) {    
      return res.status(400).json({    
        success: false,    
        message: 'Longitude invalide (doit être entre -180 et 180)'    
      });    
    }    

    if (!profile?.city_id) {  
      return res.status(400).json({  
        success: false,  
        message: 'La sélection d\'une ville est requise'  
      });  
    }
        
    // Créer PhysicalUser ou MoralUser selon le type        
    if (type_personne === 'PHYSIQUE') {        
      // Validation pour personne physique        
      if (!profile.first_name || !profile.last_name || !profile.civilite) {        
        return res.status(400).json({        
          success: false,        
          message: 'Prénom, nom et civilité sont requis pour une personne physique'        
        });        
      }        
        
      const physicalUser = new PhysicalUser({        
        user_id: userId,        
        first_name: profile.first_name,        
        last_name: profile.last_name,        
        civilite: profile.civilite,        
        telephone_principal: profile.telephone_principal      
      });        
      await physicalUser.save();        
    
      // Créer l'adresse principale 
      if (profile.adresse_principale) {      
          
        const newAddress = new Address({      
          user_id: userId,  
          street: profile.adresse_principale,      
          city_id: profile.city_id,  
          latitude: profile.latitude || null,  
          longitude: profile.longitude || null,  
          type_adresse: 'DOMICILE',      
          is_principal: true      
        });      
        const savedAddress = await newAddress.save();      
            
        const userAddress = new UserAddress({      
          physical_user_id: physicalUser._id,      
          address_id: savedAddress._id,      
          is_principal: true      
        });      
        await userAddress.save();      
      }    
        
      // Créer Customer        
      const customer_code = await generateCustomerCode('PHYSIQUE');        
      const customer = new Customer({        
        customer_code,        
        type_client: 'PHYSIQUE',        
        physical_user_id: physicalUser._id,        
        statut: 'ACTIF'        
      });        
      await customer.save();        
        
    } else if (type_personne === 'MORAL') {        
      // Validation pour personne morale        
      if (!profile.raison_sociale) {        
        return res.status(400).json({        
          success: false,        
          message: 'Raison sociale est requise pour une entreprise'        
        });        
      }        
        
      const moralUser = new MoralUser({        
        user_id: userId,        
        raison_sociale: profile.raison_sociale,        
        ice: profile.ice,        
        patente: profile.patente,        
        rc: profile.rc,        
        ville_rc: profile.ville_rc,        
        telephone_principal: profile.telephone_principal  
        // ✅ SUPPRIMER city_id et region_principale        
      });        
      await moralUser.save();       
          
      // Créer l'adresse principale 
      if (profile.adresse_principale) {      
          
        const newAddress = new Address({      
          user_id: userId,  
          street: profile.adresse_principale,      
          city_id: profile.city_id, 
          latitude: profile.latitude || null,  
          longitude: profile.longitude || null,  
          type_adresse: 'SIÈGE SOCIAL',      
          is_principal: true      
        });      
        const savedAddress = await newAddress.save();      
            
        const userAddress = new UserAddress({      
          moral_user_id: moralUser._id,      
          address_id: savedAddress._id,      
          is_principal: true      
        });      
        await userAddress.save();      
      }    
        
      // Créer Customer        
      const customer_code = await generateCustomerCode('MORAL');        
      const customer = new Customer({        
        customer_code,        
        type_client: 'MORAL',        
        moral_user_id: moralUser._id,        
        statut: 'ACTIF'        
      });        
      await customer.save();        
        
    } else {        
      return res.status(400).json({        
        success: false,        
        message: 'Type de personne invalide. Doit être PHYSIQUE ou MORAL'        
      });        
    }        
        
    // Activer l'utilisateur        
    await User.findByIdAndUpdate(userId, { statut: 'ACTIF' });        
        
    res.json({         
      success: true,         
      message: 'Profil complété avec succès. Votre compte est maintenant actif.'         
    });        
        
  } catch (error) {        
    console.error('Erreur lors de la complétion du profil:', error);        
            
    // Gestion spécifique des erreurs de duplication        
    if (error.code === 11000) {        
      const field = Object.keys(error.keyPattern)[0];        
      return res.status(400).json({        
        success: false,        
        message: `Ce ${field} est déjà utilisé par un autre utilisateur`        
      });        
    }        
        
    res.status(500).json({         
      success: false,         
      message: 'Erreur interne du serveur',        
      error: error.message         
    });        
  }        
};      
            
module.exports = {              
  register,              
  login,       
  completeProfile      
};
