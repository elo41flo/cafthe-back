const db = require("../../db");

// 1. Récupérer tous les produits avec leurs promotions
const getAllProduit = async () => {
    try {
        // Ajout de la jointure pour avoir le taux de remise dès le départ
        const query = `
            SELECT p.*, pr.taux_remise, pr.nom_promotion 
            FROM \`cafthe3\`.\`produits\` p
            LEFT JOIN \`cafthe3\`.\`promotions\` pr ON p.numero_promotion = pr.numero_promotion
        `; 
        const [rows] = await db.query(query);
        return rows;
    } catch (error) {
        const fs = require("fs");
        fs.appendFileSync("debug_log.txt", `❌ ERREUR SQL REQUETE : ${error.message} \n`);
        throw error;
    }
};

// 2. Récupérer un produit par son numéro (Correction de la syntaxe SQL)
const getProduitById = async (id) => {
    const query = `
        SELECT p.*, pr.taux_remise, pr.nom_promotion 
        FROM \`produits\` p 
        LEFT JOIN \`promotions\` pr ON p.numero_promotion = pr.numero_promotion
        WHERE p.numero_produit = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0]; 
};

// 3. Récupérer par catégorie
const getProduitByCategory = async (categorie) => {
    // Note : Vérifie si ta colonne s'appelle 'categorie' ou 'numero_categorie'
    const query = "SELECT * FROM produits WHERE categorie = ?";
    const [rows] = await db.query(query, [categorie]);
    return rows;
};

// --- Fonctions pour l'accueil ---

// Simule les produits phares (on prend les 4 premiers disponibles)
const getProduitsPhares = async () => {
    const query = "SELECT * FROM produits WHERE stock > 0 LIMIT 4";
    const [rows] = await db.query(query);
    return rows;
};

// Nouveautés : les 4 derniers IDs insérés
const getProduitsNouveaux = async () => {
    const query = "SELECT * FROM produits ORDER BY numero_produit DESC LIMIT 4";
    const [rows] = await db.query(query);
    return rows;
};

module.exports = { 
    getAllProduit, 
    getProduitById, 
    getProduitByCategory,
    getProduitsPhares,
    getProduitsNouveaux
};