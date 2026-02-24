const db = require("../../db");

const registerOrder = async (req, res) => {
    try {
        const { total_ttc, items, is_abonnement, type_abo, duree_abo } = req.body;
        const clientId = req.client.id; // Récupéré par ton middleware verifyToken

        if (!clientId) {
            return res.status(401).json({ message: "Utilisateur non identifié" });
        }

        // 1. Insérer la commande dans la table 'commande'
        const sqlOrder = "INSERT INTO commande (numero_client, date_commande, total_ttc) VALUES (?, NOW(), ?)";
        const [orderResult] = await db.query(sqlOrder, [clientId, total_ttc]);
        
        const orderId = orderResult.insertId;

        // 2. Insérer les produits dans la table de liaison (ex: 'contenir')
        if (items && items.length > 0) {
            const sqlItems = "INSERT INTO contenir (numero_commande, numero_produit, quantite_gramme) VALUES ?";
            const itemsValues = items.map(item => [orderId, item.id, item.quantite || 100]); 
            await db.query(sqlItems, [itemsValues]);
        }

        // 3. LOGIQUE ABONNEMENT : Si c'est une box, on met à jour le client
        if (is_abonnement === true) {
            const sqlUpdateClient = `
                UPDATE client 
                SET est_abonne = 1, 
                    type_abonnement = ?, 
                    date_debut_abo = CURDATE(), 
                    duree_abo_mois = ? 
                WHERE numero_client = ?`;
            
            await db.query(sqlUpdateClient, [type_abo, duree_abo, clientId]);
            console.log(`Abonnement activé pour le client ${clientId}`);
        }

        res.status(201).json({ 
            message: "Commande enregistrée avec succès", 
            orderId: orderId 
        });

    } catch (error) {
        console.error("Erreur détaillée lors de l'enregistrement de la commande :", error);
        res.status(500).json({ 
            message: "Erreur interne du serveur lors de l'enregistrement", 
            error: error.message 
        });
    }
};

// --- Récupérer les commandes d'un client (pour l'historique) ---
const getMyOrders = async (req, res) => {
    try {
        const clientId = req.client.id;
        const [orders] = await db.query(
            "SELECT * FROM commande WHERE numero_client = ? ORDER BY date_commande DESC", 
            [clientId]
        );
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
    }
};

module.exports = { 
    registerOrder,
    getMyOrders
};