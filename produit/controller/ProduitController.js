// Controleur Produit
const { getAllProduit, getProduitById, getProduitByCategory } = require("../models/ProduitModel");

const getAll = async (req, res) => {
    try {
        const produit = await getAllProduit(); 
        
        res.json({
            message: "Produits récupérés avec succès",
            count: produit.length,
            produit,
        });
    } catch (error) {
        console.error("Erreur de récupération des produits", error.message);
        res.status(500).json({
            message: "Erreur de récupération des produits",
        });
    }
};

// Récupérer un produit par son id
const getById = async (req,res) => {
    try {
        const { id } = req.params;
        const produitId = parseInt(id);

        const produit = await getProduitById(produitId);

        if ( produit.lenght === 0) {
            return res.status(404).json({
                message: "Article non trouvé"
            });
        }

        res.json({
            message: "Article récupéré avec succès",
            produit: produit[0]
        })
    } catch (error) {
        console.error("Erreur de récupération des produit", error.message);
        res.status(500).json({
            message: "Erreur de récupération des produits",
        });
    }
};

// Récupérer les produit par catégorie
const getByCategory = async (req, res) => {
    try {
        const {categorie} = req.params;
        const produit = await getProduitByCategory(categorie);

        res.json({
            message: `Produits de la catégorie ${categorie}`,
            count: produit.lentgth,
            produit
        })

    } catch (error) {
        console.error("Erreur de récupération par catégorie", error.message);
        res.status(500).json({
            message: "Erreur de récupérération des produits",
        });
    }
};

module.exports = { getAll, getById, getByCategory };