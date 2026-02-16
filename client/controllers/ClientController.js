const { 
    findClientByEmail, 
    hashPassword, 
    createClient, 
    comparePassword,
    findClientById 
} = require("../models/ClientModel");
const jwt = require("jsonwebtoken");
const db = require("../../db");

// --- INSCRIPTION ---
const register = async (req, res) => {
    try {
        const { nom_client, prenom_client, email_client, mdp_client } = req.body;
        const existingClient = await findClientByEmail(email_client);

        if (existingClient.length > 0) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        const hash = await hashPassword(mdp_client);
        await createClient({
            nom_client,
            prenom_client,
            email_client,
            mdp_client: hash,
        });

        res.status(201).json({
            message: "Inscription réussie",
            client: { nom_client, prenom_client, email_client },
        });

    } catch (error) {
        console.error("Erreur Inscription :", error);
        res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
};

// --- CONNEXION ---
const login = async (req, res) => {
    try {
        const { email_client, mdp_client } = req.body;
        const utilisateur = await findClientByEmail(email_client);
        
        if (utilisateur.length === 0) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        const client = utilisateur[0];
        const isMatch = await comparePassword(mdp_client, client.mdp_client);

        if (!isMatch) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        const expire = parseInt(process.env.JWT_EXPRESS_IN, 10) || 3600;
        // Dans la fonction login de ClientController.js
        const token = jwt.sign(
            { 
                id: client.numero_client, // C'EST CETTE LIGNE QUI MANQUAIT DANS TON TOKEN
                email: client.email_client 
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // On garde le cookie au cas où, mais on envoie surtout le token en JSON
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, 
            sameSite: "lax", 
            maxAge: 3600 * 1000, 
            path: "/"
        });

        // RÉPONSE JSON AVEC LE TOKEN
        res.json({ 
            message: "Connexion réussie", 
            token: token, 
            client: client 
        });
    } catch (error) {
        console.error("Erreur Login :", error);
        res.status(500).json({ message: "Erreur de connexion" });
    }
};

// --- DÉCONNEXION ---
const logout = (req, res) => {
    res.clearCookie("token", { 
        httpOnly: true, 
        secure: false, 
        sameSite: "lax",
        path: "/" 
    });
    res.json({ message: "Déconnexion réussie" });
};

// --- RÉCUPÉRATION INFOS ---
// --- RÉCUPÉRATION INFOS (ClientController.js) ---
const getMe = async (req, res) => {
    try {
        const clientId = req.client?.id;

        if (!clientId) {
            return res.status(401).json({ message: "ID client manquant" });
        }

        // ON UTILISE numero_client ICI (comme dans ta capture d'écran)
        const sql = "SELECT numero_client, nom_client, prenom_client, email_client, telephone, adresse_livraison FROM client WHERE numero_client = ?";
        const [results] = await db.query(sql, [clientId]);

        if (results.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        // On renvoie le résultat
        res.json(results[0]);
    } catch (error) {
        console.error("Erreur SQL:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// --- MISE À JOUR PROFIL ---
const updateProfile = async (req, res) => {
    try {
        const { nom, prenom, telephone } = req.body;
        const clientId = req.client.id; // Récupéré du token

        // On utilise les noms EXACTS de ta base : telephone et numero_client
        const sql = "UPDATE client SET nom_client = ?, prenom_client = ?, telephone = ? WHERE numero_client = ?";
        
        await db.query(sql, [nom, prenom, telephone, clientId]);
        
        res.json({ message: "Profil mis à jour avec succès" });
    } catch (error) {
        console.error("Erreur SQL détaillée :", error); // Regarde ton terminal VS Code pour voir l'erreur précise
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
    }
};

// --- MISE À JOUR ADRESSE ---
const updateAddress = async (req, res) => {
    try {
        const { adresse_principale } = req.body; // C'est ce qu'on envoie du front
        const clientId = req.client.id; // L'ID du badge

        // ON CORRIGE LES NOMS ICI :
        const sql = "UPDATE client SET adresse_livraison = ? WHERE numero_client = ?";
        
        await db.query(sql, [adresse_principale, clientId]);
        
        res.json({ message: "Adresse mise à jour avec succès" });
    } catch (error) {
        console.error("Erreur SQL Adresse :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// --- MISE À JOUR MOT DE PASSE ---
const updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const clientId = req.client.id; // Récupéré du token (ton chiffre 1)

        // 1. On crypte le mot de passe
        const hash = await hashPassword(newPassword);

        // 2. ON UTILISE LES BONS NOMS : mdp_client et numero_client
        const sql = "UPDATE client SET mdp_client = ? WHERE numero_client = ?";
        
        await db.query(sql, [hash, clientId]);
        
        res.json({ message: "Mot de passe modifié avec succès" });
    } catch (error) {
        console.error("ERREUR SQL PASSWORD :", error); // Regarde ton terminal noir !
        res.status(500).json({ message: "Erreur serveur" });
    }
};

module.exports = { 
    register, login, logout, getMe, updateProfile, updateAddress, updatePassword 
};