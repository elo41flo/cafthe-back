const db = require("../../db");

const registerOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { total_ttc, items, is_abonnement, type_abo, duree_abo } = req.body;
        const clientId = req.client ? req.client.id : (req.user ? req.user.id : null);

        if (!clientId) return res.status(401).json({ message: "Utilisateur non identifié" });

        await connection.beginTransaction();

        const sqlOrder = "INSERT INTO commande (numero_client, date_commande, total_ttc) VALUES (?, NOW(), ?)";
        const [orderResult] = await connection.query(sqlOrder, [clientId, total_ttc]);
        const orderId = orderResult.insertId;

        if (items && items.length > 0) {
            const sqlItems = "INSERT INTO contenir (numero_commande, numero_produit, quantite_gramme) VALUES ?";
            const itemsValues = items.map(item => [orderId, item.id, item.quantite || 100]); 
            await connection.query(sqlItems, [itemsValues]);
        }

        if (is_abonnement === true || is_abonnement === "true") {
            const sqlUpdateClient = `
                UPDATE client 
                SET est_abonne = 1, type_abonnement = ?, date_debut_abo = CURDATE(), duree_abo_mois = ? 
                WHERE numero_client = ?`;
            await connection.query(sqlUpdateClient, [type_abo, duree_abo, clientId]);
        }

        await connection.commit();
        res.status(201).json({ message: "Commande enregistrée", orderId });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: "Erreur enregistrement", error: error.message });
    } finally {
        connection.release();
    }
};

const getMyOrders = async (req, res) => {
    try {
        const clientId = req.client ? req.client.id : req.user.id;
        const [orders] = await db.query(
            "SELECT * FROM commande WHERE numero_client = ? ORDER BY date_commande DESC", 
            [clientId]
        );
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Erreur historique" });
    }
};

// AJOUT : Pour éviter le crash si ton router appelle cette fonction
const getOrderItems = async (req, res) => {
    try {
        const { orderId } = req.params;
        const [items] = await db.query(
            "SELECT p.nom_produit, c.quantite_gramme FROM contenir c JOIN produits p ON c.numero_produit = p.numero_produit WHERE c.numero_commande = ?",
            [orderId]
        );
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Erreur détails commande" });
    }
};

// Vérifie que ces noms correspondent EXACTEMENT à ton CommandeRouter.js
module.exports = { 
    registerOrder, // Si ton router utilise createOrder, change le nom ici !
    getMyOrders,
    getOrderItems
};