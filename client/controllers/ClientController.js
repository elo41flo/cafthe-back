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

        res.status(201).json({ message: "Inscription réussie" });
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

        // Création du Token (On utilise l'id pour le middleware auth)
        const token = jwt.sign(
            { id: client.numero_client, email: client.email_client },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

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
    res.json({ message: "Déconnexion réussie" });
};

// --- RÉCUPÉRATION INFOS (AVEC ABONNEMENT) ---
const getMe = async (req, res) => {
    try {
        // req.client.id vient du middleware verifyToken
        const clientId = req.client.id;
        
        const sql = `
            SELECT c.*, p.description as box_description, p.image as box_image
            FROM client c
            LEFT JOIN produits p ON c.type_abonnement = p.nom_produit
            WHERE c.numero_client = ?`;
        
        const [results] = await db.query(sql, [clientId]);
        if (results.length === 0) return res.status(404).json({ message: "Client non trouvé" });
        
        res.json(results[0]);
    } catch (error) {
        console.error("Erreur getMe:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// --- MISE À JOUR PROFIL ---
const updateProfile = async (req, res) => {
    try {
        const { nom, prenom, telephone } = req.body;
        const clientId = req.client.id; 

        const sql = "UPDATE client SET nom_client = ?, prenom_client = ?, telephone = ? WHERE numero_client = ?";
        await db.query(sql, [nom, prenom, telephone, clientId]);
        
        res.json({ message: "Profil mis à jour avec succès" });
    } catch (error) {
        console.error("Erreur updateProfile:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};

// --- MISE À JOUR ADRESSE ---
const updateAddress = async (req, res) => {
    try {
        const { rue, cp, ville, type_adresse } = req.body;
        const clientId = req.client.id;

        let sql = "";
        if (type_adresse === "facturation") {
            sql = "UPDATE client SET adresse_facturation = ?, code_postal_facturation = ?, ville_facturation = ? WHERE numero_client = ?";
        } else {
            sql = "UPDATE client SET adresse_livraison = ?, code_postal_livraison = ?, ville_livraison = ? WHERE numero_client = ?";
        }

        await db.query(sql, [rue, cp, ville, clientId]);
        res.json({ message: "Adresse mise à jour !" });
    } catch (error) {
        console.error("Erreur updateAddress :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// --- MISE À JOUR MOT DE PASSE ---
const updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const clientId = req.client.id; 

        const hash = await hashPassword(newPassword);
        const sql = "UPDATE client SET mdp_client = ? WHERE numero_client = ?";
        await db.query(sql, [hash, clientId]);
        
        res.json({ message: "Mot de passe modifié avec succès" });
    } catch (error) {
        console.error("Erreur updatePassword:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// --- RÉINITIALISATION MOT DE PASSE (MOT DE PASSE OUBLIÉ) ---
const resetPassword = async (req, res) => {
    try {
        const { email_client, new_password } = req.body;
        const hash = await hashPassword(new_password);

        const sql = "UPDATE client SET mdp_client = ? WHERE email_client = ?";
        const [result] = await db.query(sql, [hash, email_client]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Aucun compte trouvé avec cet email" });
        }

        res.json({ message: "Mot de passe réinitialisé !" });
    } catch (error) {
        console.error("Erreur resetPassword:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// --- HISTORIQUE DES COMMANDES ---
const getMyOrders = async (req, res) => {
    try {
        const clientId = req.client.id;
        const sql = "SELECT * FROM commande WHERE numero_client = ? ORDER BY date_commande DESC";
        const [orders] = await db.query(sql, [clientId]);
        res.json(orders);
    } catch (error) {
        console.error("Erreur getMyOrders:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// --- DÉTAILS D'UNE COMMANDE ---
const getOrderItems = async (req, res) => {
    try {
        const { orderId } = req.params;
        const sql = `
            SELECT p.*, lc.quantite 
            FROM produits p
            INNER JOIN contenir lc ON p.numero_produit = lc.numero_produit
            WHERE lc.numero_commande = ?`;
        
        const [items] = await db.query(sql, [orderId]);
        res.json(items);
    } catch (error) {
        console.error("Erreur getOrderItems:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des articles" });
    }
};

// --- ZONE DE DANGER : SUPPRESSION DE COMPTE (RGPD) ---
// --- ZONE DE DANGER : SUPPRESSION DE COMPTE (RGPD) ---
const deleteAccount = async (req, res) => {
    try {
        const clientId = req.client.id;

        // 1. On commence par supprimer le contenu des commandes du client (table contenir)
        const deleteItemsQuery = `
            DELETE lc FROM contenir lc
            INNER JOIN commande c ON lc.numero_commande = c.numero_commande
            WHERE c.numero_client = ?`;
        
        await db.query(deleteItemsQuery, [clientId]);

        // 2. On supprime les commandes du client
        const deleteOrdersQuery = "DELETE FROM commande WHERE numero_client = ?";
        await db.query(deleteOrdersQuery, [clientId]);

        // 3. Enfin, on supprime le client
        const deleteClientQuery = "DELETE FROM client WHERE numero_client = ?";
        const [result] = await db.query(deleteClientQuery, [clientId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Compte introuvable" });
        }

        res.status(200).json({ message: "Compte et données supprimés avec succès" });
    } catch (error) {
        console.error("Erreur deleteAccount détaillée:", error);
        res.status(500).json({ 
            message: "Erreur serveur lors de la suppression", 
            error: error.message 
        });
    }
};

module.exports = { 
    register, 
    login,
    logout, 
    getMe, 
    updateProfile, 
    updateAddress, 
    updatePassword, 
    resetPassword,
    getMyOrders,
    getOrderItems,
    deleteAccount // Ajout de l'export
};