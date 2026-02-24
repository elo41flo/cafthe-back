const express = require('express');
const router = express.Router();
const db = require('../../db');

// --- ROUTE 1 : ENREGISTRER UNE COMMANDE + ACTIVER ABONNEMENT ---
router.post("/register-order", async (req, res) => {
    // Récupération des données envoyées par Paiement.jsx
    const { total, numero_client, panier, is_abonnement, type_abo, duree_abo } = req.body;

    console.log("-----------------------------------------");
    console.log("📥 COMMANDE REÇUE -> Client #", numero_client);
    console.log("📦 Détails Abo :", { is_abonnement, type_abo, duree_abo });

    try {
        // 1. Insertion de la commande dans la table 'commande'
        // On utilise 'montant_paiement' comme vu précédemment
        const sqlOrder = `INSERT INTO commande 
            (date_commande, montant_paiement, numero_client, statut_de_commande) 
            VALUES (NOW(), ?, ?, 'Payée')`;
        
        const [resultOrder] = await db.query(sqlOrder, [total, numero_client]);
        const idCommande = resultOrder.insertId;
        
        console.log("✅ COMMANDE ENREGISTRÉE ! ID:", idCommande);

        // 2. ACTIVATION / MISE À JOUR DE L'ABONNEMENT
        // On le fait avant le panier pour garantir que le profil est à jour
        if (is_abonnement) {
            console.log(`✨ MISE À JOUR CLIENT -> Durée : ${duree_abo} mois`);
            
            const sqlUpdateClient = `
                UPDATE client 
                SET est_abonne = 1, 
                    type_abonnement = ?, 
                    date_debut_abo = CURDATE(), 
                    duree_abo_mois = ? 
                WHERE numero_client = ?`;
            
            // On envoie les valeurs dynamiques reçues du front
            await db.query(sqlUpdateClient, [type_abo, duree_abo, numero_client]);
            console.log("✅ Profil client mis à jour avec succès.");
        }

        // 3. Traitement du panier (Stocks + Table de liaison 'contenir')
        if (panier && panier.length > 0) {
            for (const item of panier) {
                const pId = item.numero_produit;
                
                // Vérification de sécurité pour la clé étrangère
                const [checkProd] = await db.query("SELECT numero_produit FROM produits WHERE numero_produit = ?", [pId]);
                
                if (checkProd.length > 0) {
                    // Mise à jour des stocks
                    await db.query("UPDATE produits SET stock = stock - ? WHERE numero_produit = ?", [item.quantite, pId]);
                    
                    // Liaison dans la table 'contenir'
                    await db.query("INSERT INTO contenir (numero_commande, numero_produit, quantite_gramme) VALUES (?, ?, ?)", 
                        [idCommande, pId, item.quantite]);
                } else {
                    console.warn(`⚠️ Produit ID ${pId} absent de la BDD. Ignoré.`);
                }
            }
        }

        res.status(201).json({ success: true, id: idCommande });

    } catch (error) {
        console.error("❌ ERREUR SQL :", error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});

// --- ROUTE 2 : RÉCUPÉRER LES ARTICLES ---
router.get("/items/:orderId", async (req, res) => {
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
        console.error("❌ ERREUR ARTICLES :", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;