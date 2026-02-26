// On importe les fonctions avec leurs VRAIS noms définis dans le Model
const { 
    getAllProduit, 
    getProduitById, 
    getProduitByCategory,
    getProduitsPhares,
    getProduitsNouveaux 
} = require("../models/ProduitModel");

const calculerPrixPromotion = (p) => {
    if (!p) return null;
    const remise = parseFloat(p.taux_remise) || 0;
    const prixFinal = p.prix_ttc * (1 - remise / 100);
    return {
        ...p,
        prix_final_ttc: parseFloat(prixFinal.toFixed(2)),
        est_en_promotion: remise > 0
    };
};

// Vérifie bien que les noms exportés ici correspondent à ton ProduitRouter.js
const getAll = async (req, res) => {
    try {
        const rows = await getAllProduit(); // Appel du bon nom
        const produits = rows.map(calculerPrixPromotion);
        res.json(produits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const data = await getProduitById(req.params.id);
        if (!data) return res.status(404).json({ message: "Produit non trouvé" });
        res.json(calculerPrixPromotion(data));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getByCategory = async (req, res) => {
    try {
        const rows = await getProduitByCategory(req.params.categorie);
        res.json(rows.map(calculerPrixPromotion));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFeatured = async (req, res) => {
    try {
        const rows = await getProduitsPhares();
        res.json(rows.map(calculerPrixPromotion));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNew = async (req, res) => {
    try {
        const rows = await getProduitsNouveaux();
        res.json(rows.map(calculerPrixPromotion));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// On exporte les noms courts que le Router attend
module.exports = { 
    getAll, 
    getById, 
    getByCategory, 
    getFeatured, 
    getNew 
};