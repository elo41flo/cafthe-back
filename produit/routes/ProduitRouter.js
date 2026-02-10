// Router Articles
// Chemin de base : /api/produits

const express = require("express");
// Ajout des nouvelles fonctions importées du contrôleur
const { 
    getAll, 
    getById, 
    getByCategory, 
    getFeatured, 
    getNew 
} = require("../controller/ProduitController");

// Initialisation du routeur
const router = express.Router();

// Middleware de test
const verifyToken = (req, res, next) => { next(); };

/**
 * @route   GET /api/produits/categorie/:categorie
 * @desc    Récupérer les produits filtrés par la colonne 'categorie'
 */
router.get("/categorie/:categorie", getByCategory);

/**
 * @route   GET /api/produits
 * @desc    Récupérer tous les produits de la table 'Produits'
 */
router.get("/", getAll);

/**
 * @route   GET /api/produits/:id
 * @desc    Récupérer un produit par son 'numero_produit'
 */
router.get("/:id", getById);

module.exports = router;