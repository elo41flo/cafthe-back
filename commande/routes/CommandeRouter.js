const express = require('express');
const router = express.Router();
const db = require('../../db');

/**
 * ROUTE 1 : RÉCUPÉRER LES ARTICLES D'UNE COMMANDE (Pour le bouton Recommander)
 */
router.get("/items/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;

        // Requête SQL avec des alias (AS) pour correspondre aux clés attendues par ton panier React
        const sql = `
            SELECT 
                p.numero_produit AS id, 
                p.nom_produit AS nom, 
                p.prix_produit AS prix, 
                p.image_produit AS image,
                c.quantite_gramme AS quantite
            FROM produits p
            INNER JOIN contenir c ON p.numero_produit = c.numero_produit
            WHERE c.numero_commande = ?`;

        const [items] = await db.query(sql, [orderId]);

        if (items.length === 0) {
            return res.status(404).json({ message: "Aucun article trouvé." });
        }

        res.json(items);
    } catch (error) {
        console.error("Erreur SQL items commande:", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des articles" });
    }
});

/**
 * ROUTE 2 : ENREGISTRER UNE COMMANDE (Ton code de transaction)
 */
router.post("/register-order", async (req, res) => {
    const { total, numero_client, panier, is_abonnement, type_abo, duree_abo } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Insertion commande
        const sqlOrder = `INSERT INTO commande (date_commande, montant_paiement, numero_client, statut_de_commande) VALUES (NOW(), ?, ?, 'Payée')`;
        const [resultOrder] = await connection.query(sqlOrder, [total, numero_client]);
        const idCommande = resultOrder.insertId;

        // Si c'est un abonnement, on met à jour le client
        if (is_abonnement) {
            const sqlUpdateClient = `UPDATE client SET est_abonne = 1, type_abonnement = ?, date_debut_abo = CURDATE(), duree_abo_mois = ? WHERE numero_client = ?`;
            await connection.query(sqlUpdateClient, [type_abo, duree_abo, numero_client]);
        }

        // Insertion des produits dans la table 'contenir'
        if (panier && panier.length > 0) {
            for (const item of panier) {
                await connection.query("INSERT INTO contenir (numero_commande, numero_produit, quantite_gramme) VALUES (?, ?, ?)", [idCommande, item.id || item.numero_produit, item.quantite]);
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, id: idCommande });
    } catch (error) {
        await connection.rollback();
        console.error("Erreur transaction:", error);
        res.status(500).json({ error: "Erreur lors de la commande" });
    } finally {
        connection.release();
    }
});

module.exports = router;