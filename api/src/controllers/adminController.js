const User = require('../models/User');    
const PhysicalUser = require('../models/PhysicalUser');    
const MoralUser = require('../models/MoralUser');    
const Customer = require('../models/Customer');    
const Employe = require('../models/Employe');    
const Role = require('../models/Role');    
const { hashPassword } = require('../utils/password');    
const { generateCustomerCode } = require('../utils/customerCode');    
const mongoose = require('mongoose');      
const City = require('../models/City');      
// ✅ SUPPRIMER const Region = require('../models/Region');    
const Address = require('../models/Address');    
const UserAddress = require('../models/UserAddress');  
  
const getClients = async (req, res) => {  
  try {  
    const clients = await Customer.find({})    
    .populate({    
      path: 'physical_user_id',    
      populate: [    
        {    
          path: 'user_id',    
          populate: {    
            path: 'role_id',    
            select: 'code nom'    
          }    
        }
        // ✅ SUPPRIMER toutes les populations region_principale et city_id    
      ]    
    })    
    .populate({    
      path: 'moral_user_id',    
      populate: [    
        {    
          path: 'user_id',    
          populate: {    
            path: 'role_id',    
            select: 'code nom'    
          }    
        }
        // ✅ SUPPRIMER toutes les populations region_principale et city_id    
      ]    
    });  
  
    const formattedClients = clients.map(client => {  
      let clientData = {  
        id: client._id,  
        customer_code: client.customer_code,  
        type_client: client.type_client,  
        statut: client.statut,  
        credit_limite: client.credit_limite,  
        credit_utilise: client.credit_utilise,  
        date_inscription: client.date_inscription  
      };  
  
      if (client.physical_user_id) {  
        clientData.user_info = {  
          id: client.physical_user_id.user_id._id,  
          email: client.physical_user_id.user_id.email,  
          statut: client.physical_user_id.user_id.statut,  
          type: 'PHYSIQUE',  
          first_name: client.physical_user_id.first_name,  
          last_name: client.physical_user_id.last_name,  
          civilite: client.physical_user_id.civilite,  
          telephone_principal: client.physical_user_id.telephone_principal
          // ✅ SUPPRIMER city_id, region_principale et date_naissance
        };  
      } else if (client.moral_user_id) {  
        clientData.user_info = {  
          id: client.moral_user_id.user_id._id,  
          email: client.moral_user_id.user_id.email,  
          statut: client.moral_user_id.user_id.statut,  
          type: 'MORAL',  
          raison_sociale: client.moral_user_id.raison_sociale,  
          ice: client.moral_user_id.ice,  
          patente: client.moral_user_id.patente,  
          rc: client.moral_user_id.rc,  
          ville_rc: client.moral_user_id.ville_rc,  
          telephone_principal: client.moral_user_id.telephone_principal
          // ✅ SUPPRIMER city_id et region_principale  
        };  
      }  
  
      return clientData;  
    });  
  
    res.json({  
      success: true,  
      count: formattedClients.length,  
      data: formattedClients  
    });  
  } catch (error) {  
    console.error('Erreur lors de la récupération des clients:', error);  
    res.status(500).json({  
      success: false,  
      message: 'Erreur interne du serveur',  
      error: error.message  
    });  
  }  
};  
  
const getEmployees = async (req, res) => {  
  try {  
    const employees = await Employe.find({ actif: true })  
        .populate({    
          path: 'physical_user_id',    
          populate: [    
            {    
              path: 'user_id',    
              populate: {    
                path: 'role_id',    
                select: 'code nom'    
              }    
            }
            // ✅ SUPPRIMER toutes les populations region_principale et city_id    
          ]    
        });  
  
    const formattedEmployees = employees.map(employee => ({  
      id: employee._id,  
      matricule: employee.matricule,  
      cin: employee.cin,  
      cnss: employee.cnss,  
      fonction: employee.fonction,  
      date_embauche: employee.date_embauche,  
      salaire_base: employee.salaire_base,  
      user_info: {  
        id: employee.physical_user_id.user_id._id,  
        email: employee.physical_user_id.user_id.email,  
        statut: employee.physical_user_id.user_id.statut,  
        first_name: employee.physical_user_id.first_name,  
        last_name: employee.physical_user_id.last_name,  
        civilite: employee.physical_user_id.civilite,  
        telephone_principal: employee.physical_user_id.telephone_principal
        // ✅ SUPPRIMER city_id, region_principale et date_naissance
      }  
    }));  
  
    res.json({  
      success: true,  
      count: formattedEmployees.length,  
      data: formattedEmployees  
    });  
  } catch (error) {  
    console.error('Erreur lors de la récupération des employés:', error);  
    res.status(500).json({  
      success: false,  
      message: 'Erreur interne du serveur',  
      error: error.message  
    });  
  }  
};  

const createUser = async (req, res) => {    
  try {    
    const {    
      email,    
      password,    
      role_code,    
      type_personne,    
      profile,    
      customer_info,    
      employee_info    
    } = req.body;    
    
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
    
    const existingUser = await User.findOne({ email });    
    if (existingUser) {    
      return res.status(400).json({    
        success: false,    
        message: 'Un utilisateur avec cet email existe déjà'    
      });    
    }    
    
    let finalRoleCode = role_code;    
    if (role_code === 'EMPLOYE' && employee_info?.fonction === 'MAGASINIER') {    
      finalRoleCode = 'EMPLOYE_MAGASIN';    
    }    
    
    const role = await Role.findOne({ code: finalRoleCode });    
    if (!role) {    
      return res.status(400).json({    
        success: false,    
        message: `Rôle ${finalRoleCode} invalide`    
      });    
    }    
    
    const password_hash = await hashPassword(password);    
    
    const newUser = new User({    
      email,    
      password_hash,    
      role_id: role._id,    
      statut: 'ACTIF'    
    });    
    await newUser.save();    
    
    let responseData = {    
      user: {    
        id: newUser._id,    
        email: newUser.email,    
        role: finalRoleCode,    
        statut: newUser.statut    
      }    
    };    
    
    if (type_personne === 'PHYSIQUE') {    
      if (!profile?.first_name || !profile?.last_name || !profile?.civilite) {    
        throw new Error('Prénom, nom et civilité sont requis pour une personne physique');    
      }    
    
      const physicalUser = new PhysicalUser({      
        user_id: newUser._id,      
        first_name: profile.first_name,      
        last_name: profile.last_name,      
        civilite: profile.civilite,      
        telephone_principal: profile.telephone_principal
        // ✅ SUPPRIMER city_id, region_principale et date_naissance      
      });    
      await physicalUser.save();    
  
      // Créer l'adresse principale avec Casablanca par défaut
      if (profile.adresse_principale) {    
        // ✅ Récupérer l'ObjectId de Casablanca
        const casablancaCity = await City.findOne({ name: 'Casablanca' });
        
        const newAddress = new Address({    
          user_id: newUser._id,
          street: profile.adresse_principale,    
          city_id: casablancaCity?._id, // ✅ Utiliser Casablanca par défaut
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
    
      responseData.profile = {    
        type: 'PHYSIQUE',    
        ...physicalUser.toObject()    
      };    
    
      if (finalRoleCode === 'CLIENT') {    
        const customer_code = await generateCustomerCode('PHYSIQUE');    
        const customer = new Customer({    
          customer_code,    
          type_client: 'PHYSIQUE',    
          physical_user_id: physicalUser._id,    
          credit_limite: customer_info?.credit_limite || 0,    
          statut: customer_info?.statut || 'ACTIF'    
        });    
        await customer.save();    
        responseData.customer = customer;    
      } else if (finalRoleCode === 'EMPLOYE' || finalRoleCode === 'EMPLOYE_MAGASIN') {    
        if (!employee_info?.fonction || !employee_info?.date_embauche) {    
          throw new Error('Fonction et date d\'embauche sont requises pour un employé');    
        }    
    
        if (!employee_info?.cin || !employee_info?.cnss) {    
          throw new Error('CIN et CNSS sont obligatoires pour un employé');    
        }    
    
        const employeCount = await Employe.countDocuments();    
        const matricule = `EMP${(employeCount + 1).toString().padStart(6, '0')}`;    
    
        const employe = new Employe({    
          physical_user_id: physicalUser._id,    
          matricule,    
          cin: employee_info.cin,    
          cnss: employee_info.cnss,    
          fonction: employee_info.fonction,    
          date_embauche: employee_info.date_embauche,    
          salaire_base: employee_info.salaire_base    
        });    
        await employe.save();    
        responseData.employe = employe;    
      }    
    } else if (type_personne === 'MORAL') {    
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
        // ✅ SUPPRIMER city_id et region_principale      
      });    
      await moralUser.save();    
  
      // Créer l'adresse principale avec Casablanca par défaut
      if (profile.adresse_principale) {    
        // ✅ Récupérer l'ObjectId de Casablanca
        const casablancaCity = await City.findOne({ name: 'Casablanca' });
        
        const newAddress = new Address({    
          user_id: newUser._id,
          street: profile.adresse_principale,    
          city_id: casablancaCity?._id, // ✅ Utiliser Casablanca par défaut
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
    
      responseData.profile = {    
        type: 'MORAL',    
        ...moralUser.toObject()    
      };    
    
      if (finalRoleCode === 'CLIENT') {    
        const customer_code = await generateCustomerCode('MORAL');    
        const customer = new Customer({    
          customer_code,    
          type_client: 'MORAL',    
          moral_user_id: moralUser._id,    
          credit_limite: customer_info?.credit_limite || 0,    
          statut: customer_info?.statut || 'ACTIF'      
        });      
        await customer.save();      
        responseData.customer = customer;      
      }      
    }      
      
    res.status(201).json({        
      success: true,        
      message: 'Utilisateur créé avec succès par l\'administrateur',        
      data: responseData        
    });        
        
  } catch (error) {        
    console.error('Erreur lors de la création de l\'utilisateur:', error);        
        
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
    
const updateUser = async (req, res) => {        
  try {        
    const { userId } = req.params;        
    const { profile, customer_info, employee_info, statut } = req.body;        
        
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
        
    const user = await User.findById(userId).populate('role_id', 'code nom');        
    if (!user) {        
      return res.status(404).json({        
        success: false,        
        message: 'Utilisateur non trouvé'        
      });        
    }        
        
    const physicalUser = await PhysicalUser.findOne({ user_id: userId });        
    const moralUser = await MoralUser.findOne({ user_id: userId });        
        
    let updatedData = {        
      user: {        
        id: user._id,        
        email: user.email,        
        role: user.role_id.code,        
        statut: user.statut        
      }        
    };        
          
    // Mettre à jour le statut de l'utilisateur si fourni          
    if (statut && ['ACTIF', 'INACTIF', 'SUSPENDU', 'EN_ATTENTE'].includes(statut)) {          
      await User.findByIdAndUpdate(userId, { statut });          
      updatedData.user.statut = statut;          
          
      // Synchroniser le statut Customer          
      const customer = await Customer.findOne({          
        $or: [          
          { physical_user_id: physicalUser?._id },          
          { moral_user_id: moralUser?._id }          
        ]          
      });          
      if (customer) {          
        await Customer.findByIdAndUpdate(customer._id, { statut });          
      }          
    }          
          
    // Mettre à jour selon le type d'utilisateur          
    if (physicalUser && profile) {          
      const allowedFields = [          
        'first_name', 'last_name', 'civilite',          
        'telephone_principal'  
        // ✅ SUPPRIMER city_id, region_principale et date_naissance        
      ];          
          
      const updateFields = {};          
      allowedFields.forEach(field => {          
        if (profile[field] !== undefined) {          
          updateFields[field] = profile[field];          
        }          
      });          
          
      const updatedPhysicalUser = await PhysicalUser.findOneAndUpdate(          
        { user_id: userId },          
        updateFields,          
        { new: true, runValidators: true }          
      );          
          
      updatedData.profile = {          
        type: 'PHYSIQUE',          
        ...updatedPhysicalUser.toObject()          
      };          
          
      // Mettre à jour les infos employé si applicable          
      if ((user.role_id.code === 'EMPLOYE' || user.role_id.code === 'EMPLOYE_MAGASIN') && employee_info) {          
        const employe = await Employe.findOne({ physical_user_id: physicalUser._id });          
        if (employe) {          
          const employeeUpdateFields = {};          
          if (employee_info.fonction !== undefined) {          
            employeeUpdateFields.fonction = employee_info.fonction;          
          }          
          if (employee_info.cin !== undefined) {          
            employeeUpdateFields.cin = employee_info.cin;          
          }          
          if (employee_info.cnss !== undefined) {          
            employeeUpdateFields.cnss = employee_info.cnss;          
          }          
          if (employee_info.salaire_base !== undefined) {          
            employeeUpdateFields.salaire_base = employee_info.salaire_base;          
          }          
          if (employee_info.date_sortie !== undefined) {          
            employeeUpdateFields.date_sortie = employee_info.date_sortie;          
          }          
          
          if (Object.keys(employeeUpdateFields).length > 0) {          
            const updatedEmployee = await Employe.findOneAndUpdate(          
              { physical_user_id: physicalUser._id },          
              employeeUpdateFields,          
              { new: true }          
            );          
            updatedData.employee_info = updatedEmployee;          
          }          
        }          
      }      
      
      // Gérer la mise à jour d'adresse via UserAddress pour PhysicalUser  
      if (profile.adresse_principale !== undefined) {      
        const userAddress = await UserAddress.findOne({       
          physical_user_id: physicalUser._id,       
          is_principal: true       
        }).populate('address_id');      
              
        if (userAddress && userAddress.address_id) {      
          // Mettre à jour l'adresse existante avec Casablanca par défaut  
          const casablancaCity = await City.findOne({ name: 'Casablanca' });  
            
          await Address.findByIdAndUpdate(userAddress.address_id._id, {      
            street: profile.adresse_principale,      
            city_id: casablancaCity?._id,  
            latitude: profile.latitude || null,  
            longitude: profile.longitude || null  
          });      
        } else if (profile.adresse_principale) {      
          // Créer une nouvelle adresse avec Casablanca par défaut  
          const casablancaCity = await City.findOne({ name: 'Casablanca' });  
            
          const newAddress = new Address({      
            user_id: userId,      
            street: profile.adresse_principale,      
            city_id: casablancaCity?._id,  
            latitude: profile.latitude || null,  
            longitude: profile.longitude || null,  
            type_adresse: 'DOMICILE',      
            is_principal: true      
          });      
          const savedAddress = await newAddress.save();      
      
          const newUserAddress = new UserAddress({      
            physical_user_id: physicalUser._id,      
            address_id: savedAddress._id,      
            is_principal: true      
          });      
          await newUserAddress.save();      
        }      
      }      
    }          
          
    // Gérer les utilisateurs moraux          
    if (moralUser && profile) {          
      const allowedFields = [          
        'raison_sociale', 'ice', 'patente', 'rc', 'ville_rc',          
        'telephone_principal'  
        // ✅ SUPPRIMER city_id et region_principale        
      ];        
          
      const updateFields = {};          
      allowedFields.forEach(field => {          
        if (profile[field] !== undefined) {          
          updateFields[field] = profile[field];          
        }          
      });          
          
      const updatedMoralUser = await MoralUser.findOneAndUpdate(          
        { user_id: userId },          
        updateFields,          
        { new: true, runValidators: true }          
      );          
          
      updatedData.profile = {          
        type: 'MORAL',          
        ...updatedMoralUser.toObject()          
      };          
          
      // Mettre à jour les infos client moral si applicable          
      if (user.role_id.code === 'CLIENT' && customer_info) {          
        const customer = await Customer.findOne({ moral_user_id: moralUser._id });          
        if (customer) {          
          const customerUpdateFields = {};          
          if (customer_info.credit_limite !== undefined) {          
            customerUpdateFields.credit_limite = customer_info.credit_limite;          
          }          
          if (customer_info.statut !== undefined) {          
            customerUpdateFields.statut = customer_info.statut;          
          }          
          
          if (Object.keys(customerUpdateFields).length > 0) {          
            const updatedCustomer = await Customer.findOneAndUpdate(          
              { moral_user_id: moralUser._id },          
              customerUpdateFields,          
              { new: true }          
            );          
            updatedData.customer_info = updatedCustomer;          
          }          
        }          
      }      
      
      // Gérer la mise à jour d'adresse via UserAddress pour MoralUser  
      if (profile.adresse_principale !== undefined) {      
        const userAddress = await UserAddress.findOne({       
          moral_user_id: moralUser._id,       
          is_principal: true       
        }).populate('address_id');      
              
        if (userAddress && userAddress.address_id) {      
          // Mettre à jour l'adresse existante avec Casablanca par défaut  
          const casablancaCity = await City.findOne({ name: 'Casablanca' });  
            
          await Address.findByIdAndUpdate(userAddress.address_id._id, {      
            street: profile.adresse_principale,      
            city_id: casablancaCity?._id,  
            latitude: profile.latitude || null,  
            longitude: profile.longitude || null  
          });      
        } else if (profile.adresse_principale) {      
          // Créer une nouvelle adresse avec Casablanca par défaut  
          const casablancaCity = await City.findOne({ name: 'Casablanca' });  
            
          const newAddress = new Address({      
            user_id: userId,      
            street: profile.adresse_principale,      
            city_id: casablancaCity?._id,  
            latitude: profile.latitude || null,  
            longitude: profile.longitude || null,  
            type_adresse: 'SIÈGE SOCIAL',      
            is_principal: true      
          });      
          const savedAddress = await newAddress.save();      
      
          const newUserAddress = new UserAddress({      
            moral_user_id: moralUser._id,      
            address_id: savedAddress._id,      
            is_principal: true      
          });      
          await newUserAddress.save();      
        }      
      }      
    }          
          
    res.json({          
      success: true,          
      message: 'Utilisateur mis à jour avec succès',          
      data: updatedData          
    });          
          
  } catch (error) {          
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);          
          
    if (error.name === 'ValidationError') {          
      return res.status(400).json({          
        success: false,          
        message: 'Erreur de validation',          
        errors: Object.values(error.errors).map(err => err.message)          
      });          
    }          
          
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
    
const deleteUser = async (req, res) => {          
  try {          
    const { userId } = req.params;          
          
    const user = await User.findById(userId).populate('role_id', 'code nom');          
    if (!user) {          
      return res.status(404).json({          
        success: false,          
        message: 'Utilisateur non trouvé'          
      });          
    }          
          
    if (user.role_id.code === 'ADMIN') {          
      return res.status(403).json({          
        success: false,          
        message: 'Impossible de supprimer un administrateur'          
      });          
    }          
          
    const physicalUser = await PhysicalUser.findOne({ user_id: userId });          
    if (physicalUser) {          
      await UserAddress.deleteMany({ physical_user_id: physicalUser._id });      
            
      if (user.role_id.code === 'CLIENT') {          
        await Customer.deleteOne({ physical_user_id: physicalUser._id });          
      }          
          
      if (user.role_id.code === 'EMPLOYE' || user.role_id.code === 'EMPLOYE_MAGASIN') {          
        await Employe.deleteOne({ physical_user_id: physicalUser._id });          
      }          
          
      await PhysicalUser.deleteOne({ user_id: userId });          
    }          
          
    const moralUser = await MoralUser.findOne({ user_id: userId });          
    if (moralUser) {          
      await UserAddress.deleteMany({ moral_user_id: moralUser._id });      
            
      if (user.role_id.code === 'CLIENT') {          
        await Customer.deleteOne({ moral_user_id: moralUser._id });          
      }          
          
      await MoralUser.deleteOne({ user_id: userId });          
    }          
          
    await User.findByIdAndDelete(userId);          
          
    res.json({          
      success: true,          
      message: 'Utilisateur supprimé avec succès'          
    });          
          
  } catch (error) {          
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);          
    res.status(500).json({          
      success: false,          
      message: 'Erreur interne du serveur',          
      error: error.message          
    });          
  }          
};          
  
const getClientsWithAddresses = async (req, res) => {      
  try {      
    const clients = await Customer.find({})      
      .populate({    
        path: 'physical_user_id',    
        populate: [    
          {    
            path: 'user_id',    
            select: 'email statut'    
          }  
          // ✅ SUPPRIMER toutes les populations region_principale et city_id  
        ]    
      })    
      .populate({    
        path: 'moral_user_id',    
        populate: [    
          {    
            path: 'user_id',    
            select: 'email statut'    
          }  
          // ✅ SUPPRIMER toutes les populations region_principale et city_id  
        ]    
      });    
    
    const clientsWithAddresses = await Promise.all(      
      clients.map(async (client) => {      
        let addresses = [];    
        let clientData = {    
          id: client._id,    
          customer_code: client.customer_code,    
          type_client: client.type_client,    
          statut: client.statut,    
          credit_limite: client.credit_limite,    
          credit_utilise: client.credit_utilise,    
          date_inscription: client.date_inscription    
        };    
              
        if (client.physical_user_id) {      
          // Ajouter les informations utilisateur physique    
          clientData.user_info = {    
            id: client.physical_user_id.user_id._id,    
            email: client.physical_user_id.user_id.email,    
            statut: client.physical_user_id.user_id.statut,    
            type: 'PHYSIQUE',    
            first_name: client.physical_user_id.first_name,    
            last_name: client.physical_user_id.last_name,    
            civilite: client.physical_user_id.civilite,    
            telephone_principal: client.physical_user_id.telephone_principal  
            // ✅ SUPPRIMER city_id, region_principale et date_naissance  
          };    
    
          const userAddresses = await UserAddress.find({       
            physical_user_id: client.physical_user_id._id       
          })      
          .populate({      
            path: 'address_id',      
            populate: [      
              { path: 'city_id', select: 'name code' }      
              // ✅ SUPPRIMER { path: 'region_id', select: 'nom code' }  
            ]      
          });      
                
          addresses = userAddresses.map(ua => ({      
            _id: ua.address_id._id,      
            street: ua.address_id.street,    
            numappt: ua.address_id.numappt || '',    
            numimmeuble: ua.address_id.numimmeuble || '',    
            quartier: ua.address_id.quartier || '',    
            postal_code: ua.address_id.postal_code || '',    
            telephone: ua.address_id.telephone || '',    
            instructions_livraison: ua.address_id.instructions_livraison || '',    
            latitude: ua.address_id.latitude,      
            longitude: ua.address_id.longitude,    
            type_adresse: ua.address_id.type_adresse || 'DOMICILE',    
            city: ua.address_id.city_id,    
            // ✅ SUPPRIMER region: ua.address_id.region_id,  
            is_principal: ua.is_principal      
          }));      
        } else if (client.moral_user_id) {    
          // Ajouter les informations utilisateur moral    
          clientData.user_info = {    
            id: client.moral_user_id.user_id._id,    
            email: client.moral_user_id.user_id.email,    
            statut: client.moral_user_id.user_id.statut,    
            type: 'MORAL',    
            raison_sociale: client.moral_user_id.raison_sociale,    
            ice: client.moral_user_id.ice,    
            patente: client.moral_user_id.patente,    
            rc: client.moral_user_id.rc,    
            ville_rc: client.moral_user_id.ville_rc,    
            telephone_principal: client.moral_user_id.telephone_principal  
            // ✅ SUPPRIMER city_id et region_principale  
          };    
    
          const userAddresses = await UserAddress.find({       
            moral_user_id: client.moral_user_id._id       
          })      
          .populate({      
            path: 'address_id',      
            populate: [      
              { path: 'city_id', select: 'name code' }      
              // ✅ SUPPRIMER { path: 'region_id', select: 'nom code' }  
            ]      
          });      
                
          addresses = userAddresses.map(ua => ({      
            _id: ua.address_id._id,      
            street: ua.address_id.street,    
            numappt: ua.address_id.numappt || '',    
            numimmeuble: ua.address_id.numimmeuble || '',    
            quartier: ua.address_id.quartier || '',    
            postal_code: ua.address_id.postal_code || '',    
            telephone: ua.address_id.telephone || '',    
            instructions_livraison: ua.address_id.instructions_livraison || '',    
            latitude: ua.address_id.latitude,      
            longitude: ua.address_id.longitude,    
            type_adresse: ua.address_id.type_adresse || 'SIÈGE SOCIAL',    
            city: ua.address_id.city_id,    
            // ✅ SUPPRIMER region: ua.address_id.region_id,  
            is_principal: ua.is_principal      
          }));    
        }    
              
        return {      
          ...clientData,    
          addresses: addresses      
        };      
      })      
    );      
      
    res.json({      
      success: true,      
      count: clientsWithAddresses.length,      
      data: clientsWithAddresses      
    });      
  } catch (error) {    
    console.error('Erreur lors de la récupération des clients avec adresses:', error);    
    res.status(500).json({      
      success: false,      
      message: error.message      
    });      
  }      
};  
          
module.exports = {          
  getClients,          
  getEmployees,          
  createUser,          
  updateUser,          
  deleteUser,  
  getClientsWithAddresses    
};