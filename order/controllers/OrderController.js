const db = require("../../db");

const createOrder = async (req, res) => {
    try {
        const { total_ttc, panier, mode_paiement, mode_commande } = req.body;
        
        // On récupère l'ID du client depuis le token (via le middleware)
        const clientId = req.client ? req.client.id : null;

        if (!clientId) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }

        if (!panier || panier.length === 0) {
            return res.status(400).json({ message: "Le panier est vide." });
        }

        // --- 1. INSERTION DANS LA TABLE COMMANDE ---
        const sqlOrder = `
            INSERT INTO commande (
                date_commande, 
                montant_paiement, 
                numero_client, 
                statut_de_commande, 
                mode_paiement, 
                mode_commande
            ) VALUES (NOW(), ?, ?, 'Payée', ?, ?)`;

        const [result] = await db.query(sqlOrder, [
            total_ttc, 
            clientId, 
            mode_paiement || 'Carte Bancaire', 
            mode_commande || 'A emporter'
        ]);

        const newOrderId = result.insertId;

        // --- 2. INSERTION DANS LA TABLE CONTENIR (Détails) ---
        // C'est ce bloc qui permet de récupérer les produits plus tard
        for (const item of panier) {
            // On vérifie si l'ID vient de 'id' ou 'numero_produit' selon ton panier
            const idProduit = item.numero_produit || item.id;
            const quantite = item.quantite || item.quantite_gramme || 1;

            await db.query(
                "INSERT INTO contenir (numero_commande, numero_produit, quantite_gramme) VALUES (?, ?, ?)",
                [newOrderId, idProduit, quantite]
            );
        }

        res.status(201).json({ 
            message: "Commande enregistrée avec succès !", 
            numero_commande: newOrderId 
        });

    } catch (error) {
        console.error("ERREUR CRÉATION COMMANDE :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// On ajoute aussi la fonction pour récupérer les items pour le "Commander à nouveau"
const getOrderItems = async (req, res) => {
    try {
        const { orderId } = req.params;
        const sql = `
            SELECT p.*, lc.quantite_gramme 
            FROM produits p
            INNER JOIN contenir lc ON p.numero_produit = lc.numero_produit
            WHERE lc.numero_commande = ?`;
        
        const [items] = await db.query(sql, [orderId]);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Erreur récupération articles", error: error.message });
    }
};

module.exports = { createOrder, getOrderItems };