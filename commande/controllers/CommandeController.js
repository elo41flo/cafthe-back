const ClientModel = require("../models/ClientModel");
const jwt = require("jsonwebtoken");

/**
 * @swagger
 * tags:
 * name: Clients
 * description: Gestion des comptes clients et authentification
 */

// --- AUTHENTIFICATION ---

const register = async (req, res) => {
    try {
        const { nom_client, prenom_client, email_client, mdp_client } = req.body;
        
        const existingClient = await ClientModel.findClientByEmail(email_client);
        if (existingClient) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        const hashedPassword = await ClientModel.hashPassword(mdp_client);
        await ClientModel.createClient({
            nom_client, 
            prenom_client, 
            email_client, 
            mdp_client: hashedPassword
        });

        res.status(201).json({ message: "Compte créé avec succès ! Vous pouvez vous connecter." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'inscription", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email_client, mdp_client } = req.body;
        const client = await ClientModel.findClientByEmail(email_client);
        
        if (!client) return res.status(401).json({ message: "Identifiants incorrects." });

        const isMatch = await ClientModel.comparePassword(mdp_client, client.mdp_client);
        if (!isMatch) return res.status(401).json({ message: "Identifiants incorrects." });

        // Création du Token
        const token = jwt.sign(
            { id: client.numero_client }, 
            process.env.JWT_SECRET || "votre_cle_secrete_provisoire", 
            { expiresIn: "24h" }
        );

        // On ne renvoie pas le mot de passe au front, même hashé
        const { mdp_client: _, ...clientData } = client;

        res.json({ 
            token, 
            user: clientData,
            message: "Connexion réussie !" 
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur de connexion au serveur" });
    }
};

// --- GESTION DU PROFIL ---

const getMe = async (req, res) => {
    try {
        // req.user.id est injecté par ton middleware de vérification de token
        const client = await ClientModel.findClientById(req.user.id);
        if (!client) return res.status(404).json({ message: "Utilisateur non trouvé" });

        const { mdp_client, ...userProfile } = client;
        res.json(userProfile);
    } catch (error) {
        res.status(500).json({ message: "Erreur de récupération du profil" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { nom_client, prenom_client, email_client } = req.body;
        await ClientModel.updateClientInfo(req.user.id, { nom_client, prenom_client, email_client });
        res.json({ message: "Profil mis à jour avec succès !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const client = await ClientModel.findClientById(req.user.id);

        const isMatch = await ClientModel.comparePassword(oldPassword, client.mdp_client);
        if (!isMatch) return res.status(400).json({ message: "Ancien mot de passe incorrect." });

        const hashedNewPassword = await ClientModel.hashPassword(newPassword);
        await ClientModel.updatePassword(req.user.id, hashedNewPassword);

        res.json({ message: "Mot de passe modifié !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur de changement de mot de passe" });
    }
};


const deleteAccount = async (req, res) => {
    try {
        await ClientModel.deleteClient(req.user.id);
        res.json({ message: "Compte supprimé définitivement. Au revoir !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du compte" });
    }
};

// --- EXPORTS ---
module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    updatePassword,
    deleteAccount,
    // Méthodes rapides (In-line)
    logout: (req, res) => res.json({ message: "Déconnecté avec succès" }),
    resetPassword: (req, res) => res.json({ message: "Si cet email existe, un lien a été envoyé" }),
    getMyOrders: (req, res) => res.json({ message: "Liste de vos commandes" }),
    getOrderItems: (req, res) => res.json({ message: "Détails de la commande" }),
}; // On ferme l'objet avec };