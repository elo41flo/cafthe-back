// Controleur Produit
const { 
    getAllProduit, 
    getProduitById, 
    getProduitByCategory,
    getProduitsPhares,
    getProduitsNouveaux 
} = require("../models/ProduitModel");

// Helper pour calculer le prix avec remise (évite de répéter le code)
const calculerPrixPromotion = (p) => {
    const remise = parseFloat(p.taux_remise) || 0;
    const prixFinal = p.prix_ttc * (1 - remise / 100);
    return {
        ...p,
        prix_final_ttc: parseFloat(prixFinal.toFixed(2)),
        est_en_promotion: remise > 0
    };
};

// Récupérer tous les produits
const getAll = async (req, res) => {
    try {
        const rows = await getAllProduit(); 
        const produits = rows.map(calculerPrixPromotion);

        res.json({
            message: "Produits récupérés avec succès",
            count: produits.length,
            produits,
        });
    } catch (error) {
        console.error("Erreur getAll :", error.message);
        res.status(500).json({ message: "Erreur lors de la récupération des produits" });
    }
};

// Récupérer un produit par son id
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const numeroProduit = parseInt(id);

        if (isNaN(numeroProduit)) {
            return res.status(400).json({ message: "L'identifiant doit être un nombre valide" });
        }

        const data = await getProduitById(numeroProduit);

        if (!data) {
            return res.status(404).json({ message: "Ce produit n'existe pas" });
        }

        const produit = calculerPrixPromotion(data);

        res.json({ message: "Produit trouvé", produit });
    } catch (error) {
        console.error("Erreur getById :", error.message);
        res.status(500).json({ message: "Erreur lors de la recherche du produit" });
    }
};

// Récupérer par catégorie
const getByCategory = async (req, res) => {
    try {
        const { categorie } = req.params;
        const rows = await getProduitByCategory(categorie);
        const produits = rows.map(calculerPrixPromotion);

        res.json({
            message: `Catégorie : ${categorie}`,
            count: produits.length,
            produits
        });
    } catch (error) {
        console.error("Erreur getByCategory :", error.message);
        res.status(500).json({ message: "Erreur lors du filtrage" });
    }
};

// Produits Phares (Accueil)
const getFeatured = async (req, res) => {
    try {
        const rows = await getProduitsPhares();
        const produits = rows.map(calculerPrixPromotion);
        res.json(produits);
    } catch (error) {
        res.status(500).json({ message: "Erreur produits phares" });
    }
};

// Nouveautés (Accueil)
const getNew = async (req, res) => {
    try {
        const rows = await getProduitsNouveaux();
        const produits = rows.map(calculerPrixPromotion);
        res.json(produits);
    } catch (error) {
        res.status(500).json({ message: "Erreur nouveautés" });
    }
};

module.exports = { 
    getAll, 
    getById, 
    getByCategory, 
    getFeatured, 
    getNew 
};