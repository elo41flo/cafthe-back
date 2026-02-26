const db = require("../../db");

/**
 * Récupère toutes les commandes d'un client spécifique
 */
const findOrdersByClientId = async (clientId) => {
    const sql = `
        SELECT * FROM commande 
        WHERE numero_client = ? 
        ORDER BY date_commande DESC`;
    const [rows] = await db.query(sql, [clientId]);
    return rows;
};

/**
 * Récupère le détail d'une commande (les produits contenus)
 */
const findOrderDetails = async (orderId) => {
    const sql = `
        SELECT p.nom_produit, p.prix_unitaire, c.quantite_gramme 
        FROM contenir c
        JOIN produits p ON c.numero_produit = p.numero_produit
        WHERE c.numero_commande = ?`;
    const [rows] = await db.query(sql, [orderId]);
    return rows;
};

/**
 * Crée l'entrée principale de la commande
 * Note : On passe la connexion en paramètre pour permettre les transactions
 */
const createOrder = async (connection, { numero_client, total }) => {
    const sql = `
        INSERT INTO commande (date_commande, montant_paiement, numero_client, statut_de_commande) 
        VALUES (NOW(), ?, ?, 'Payée')`;
    const [result] = await connection.query(sql, [total, numero_client]);
    return result.insertId;
};

/**
 * Lie un produit à une commande et décrémente le stock
 */
const addProductToOrder = async (connection, { orderId, productId, quantity }) => {
    // 1. On ajoute dans la table de liaison
    const sqlLiaison = `
        INSERT INTO contenir (numero_commande, numero_produit, quantite_gramme) 
        VALUES (?, ?, ?)`;
    await connection.query(sqlLiaison, [orderId, productId, quantity]);

    // 2. On met à jour le stock
    const sqlStock = `
        UPDATE produits 
        SET stock = stock - ? 
        WHERE numero_produit = ?`;
    await connection.query(sqlStock, [quantity, productId]);
};

module.exports = {
    findOrdersByClientId,
    findOrderDetails,
    createOrder,
    addProductToOrder
};