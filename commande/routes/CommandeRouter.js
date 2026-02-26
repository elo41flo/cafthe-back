const express = require('express');
const router = express.Router();
const db = require('../../db');

// ROUTE 1 : ENREGISTRER UNE COMMANDE
router.post("/register-order", async (req, res) => {
    const { total, numero_client, panier, is_abonnement, type_abo, duree_abo } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const sqlOrder = `INSERT INTO commande (date_commande, montant_paiement, numero_client, statut_de_commande) VALUES (NOW(), ?, ?, 'Payée')`;
        const [resultOrder] = await connection.query(sqlOrder, [total, numero_client]);
        const idCommande = resultOrder.insertId;
        if (is_abonnement) {
            const sqlUpdateClient = `UPDATE client SET est_abonne = 1, type_abonnement = ?, date_debut_abo = CURDATE(), duree_abo_mois = ? WHERE numero_client = ?`;
            await connection.query(sqlUpdateClient, [type_abo, duree_abo, numero_client]);
        }
        if (panier && panier.length > 0) {
            for (const item of panier) {
                await connection.query("UPDATE produits SET stock = stock - ? WHERE numero_produit = ?", [item.quantite, item.numero_produit]);
                await connection.query("INSERT INTO contenir (numero_commande, numero_produit, quantite_gramme) VALUES (?, ?, ?)", [idCommande, item.numero_produit, item.quantite]);
            }
        }
        await connection.commit();
        res.status(201).json({ success: true, id: idCommande });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: "Erreur serveur" });
    } finally {
        if (connection) connection.release();
    }
});

// ROUTE 2 : RÉCUPÉRER LES ARTICLES
router.get("/items/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        const sql = `SELECT p.*, lc.quantite_gramme FROM produits p INNER JOIN contenir lc ON p.numero_produit = lc.numero_produit WHERE lc.numero_commande = ?`;
        const [items] = await db.query(sql, [orderId]);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;