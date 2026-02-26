const { 
    findClientByEmail, hashPassword, createClient, 
    comparePassword, findClientById 
} = require("../models/ClientModel");
const jwt = require("jsonwebtoken");
const db = require("../../db");

const register = async (req, res) => {
    try {
        const { nom_client, prenom_client, email_client, mdp_client } = req.body;
        const existingClient = await findClientByEmail(email_client);
        if (existingClient.length > 0) return res.status(400).json({ message: "Email déjà utilisé" });

        const hash = await hashPassword(mdp_client);
        await createClient({ nom_client, prenom_client, email_client, mdp_client: hash });
        res.status(201).json({ message: "Inscription réussie" });
    } catch (error) {
        res.status(500).json({ message: "Erreur inscription" });
    }
};

const login = async (req, res) => {
    try {
        const { email_client, mdp_client } = req.body;
        const utilisateur = await findClientByEmail(email_client);
        if (utilisateur.length === 0) return res.status(401).json({ message: "Identifiants incorrects" });

        const client = utilisateur[0];
        const isMatch = await comparePassword(mdp_client, client.mdp_client);
        if (!isMatch) return res.status(401).json({ message: "Identifiants incorrects" });

        const token = jwt.sign(
            { id: client.numero_client, email: client.email_client },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, client });
    } catch (error) {
        res.status(500).json({ message: "Erreur connexion" });
    }
};

// ... Ajoute ici toutes les autres fonctions (getMe, updateProfile, etc.) que tu as listées

module.exports = { 
    register, login, logout: (req, res) => res.json({message: "Déconnecté"}), 
    getMe, updateProfile, updateAddress, updatePassword, 
    resetPassword, getMyOrders, getOrderItems, deleteAccount 
};