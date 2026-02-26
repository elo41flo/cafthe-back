
const ClientModel = require("../models/ClientModel");
const jwt = require("jsonwebtoken");

// --- INSCRIPTION ---
const register = async (req, res) => {
    try {
        const { nom_client, prenom_client, email_client, mdp_client } = req.body;
        const existingClient = await ClientModel.findClientByEmail(email_client);
        if (existingClient) return res.status(400).json({ message: "Email déjà utilisé." });

        const hashedPassword = await ClientModel.hashPassword(mdp_client);
        await ClientModel.createClient({
            nom_client, prenom_client, email_client, mdp_client: hashedPassword
        });
        res.status(201).json({ message: "Compte créé avec succès !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur inscription", error: error.message });
    }
};

// --- CONNEXION ---
const login = async (req, res) => {
    try {
        const { email_client, mdp_client } = req.body;
        const client = await ClientModel.findClientByEmail(email_client);
        if (!client) return res.status(401).json({ message: "Identifiants invalides." });

        const isMatch = await ClientModel.comparePassword(mdp_client, client.mdp_client);
        if (!isMatch) return res.status(401).json({ message: "Identifiants invalides." });

        const token = jwt.sign(
            { id: client.numero_client }, 
            process.env.JWT_SECRET || "ton_secret_temporaire", 
            { expiresIn: "24h" }
        );
        res.json({ token, user: client });
    } catch (error) {
        res.status(500).json({ message: "Erreur connexion" });
    }
};

// --- LES FONCTIONS QUI MANQUAIENT (Stubs) ---
// On les définit ici pour que Node les reconnaisse

const getMe = async (req, res) => {
    res.json({ message: "Route Profil (à implémenter)" });
};

const updateProfile = async (req, res) => {
    res.json({ message: "Profil mis à jour" });
};

const updateAddress = async (req, res) => {
    res.json({ message: "Adresse mise à jour" });
};

const updatePassword = async (req, res) => {
    res.json({ message: "Mot de passe mis à jour" });
};

const deleteAccount = async (req, res) => {
    res.json({ message: "Compte supprimé" });
};

// --- EXPORT FINAL ---
// Chaque nom listé ici DOIT correspondre à une fonction définie plus haut
module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    updateAddress,
    updatePassword,
    deleteAccount,
    logout: (req, res) => res.json({ message: "Déconnecté" }),
    resetPassword: (req, res) => res.json({ message: "Lien envoyé" }),
    getMyOrders: (req, res) => res.json({ message: "Vos commandes" }),
    getOrderItems: (req, res) => res.json({ message: "Détails commande" }),
};