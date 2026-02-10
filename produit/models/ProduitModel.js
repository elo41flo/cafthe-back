// Model produit
const db = require("../../db");

// Récupérer tous les produits avec leurs promotions
const getAllProduit = async () => {
    const query = `
        SELECT p.*, pr.taux_remise, pr.nom_promotion 
        FROM produits p
        LEFT JOIN promotions pr ON p.numero_promotion = pr.numero_promotion
    `;
    const [rows] = await db.query(query);
    return rows;
};

// Récupérer un produit par son numéro
const getProduitById = async (id) => {
    const query = `
        SELECT p.*, pr.taux_remise, pr.nom_promotion 
        FROM produits p 
        LEFT JOIN promotions pr ON p.numero_promotion = pr.numero_promotion
        WHERE p.numero_produit = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0]; 
};

// Récupérer par catégorie
const getProduitByCategory = async (categorie) => {
    const [rows] = await db.query("SELECT * FROM produits WHERE categorie = ?", [
        categorie,
    ]);
    return rows;
};

// --- Fonctions pour l'accueil ---

// Comme tu as supprimé est_phare, on peut simuler par les meilleures ventes ou le stock
const getProduitsPhares = async () => {
    const [rows] = await db.query("SELECT * FROM produits LIMIT 4"); // En attendant un critère
    return rows;
};

// Comme tu as supprimé est_nouveau, on prend les derniers IDs insérés
const getProduitsNouveaux = async () => {
    const [rows] = await db.query("SELECT * FROM produits ORDER BY numero_produit DESC LIMIT 4");
    return rows;
};

module.exports = { 
    getAllProduit, 
    getProduitById, 
    getProduitByCategory,
    getProduitsPhares,
    getProduitsNouveaux
};