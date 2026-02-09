// Model produit

const db = require("../../db");

// Récupérer tous les produit
const getAllProduit = async () => {
    const [rows] = await db.query("SELECT * FROM produit");
    return rows;
};

const getProduitById = async (id) => {
    const [rows] = await db.query("SELECT * FROM produit WHERE id_produit = ?", [
        id,
    ]);
    return rows;
};

// Récupérer un article par sa catégorie
const getProduitByCategory = async (categorie) => {
    const [rows] = await db.query("SELECT * FROM produit WHERE categorie = ?", [
        categorie,
    ]);
    return rows;
};

module.exports = { getAllProduit, getProduitById, getProduitByCategory };