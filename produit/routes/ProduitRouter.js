const express = require("express");
const router = express.Router();

// Import des fonctions du contrôleur
// NOTE : Vérifie bien si ton dossier est 'controller' ou 'controllers'
const { 
    getAll, 
    getById, 
    getByCategory, 
    getFeatured, 
    getNew 
} = require("../controller/ProduitController");

// --- ROUTES SPÉCIFIQUES ---
// Toujours placer les routes fixes AVANT les routes avec paramètres (:id)

/**
 * @route   GET /api/produits/phares
 * @desc    Récupérer les pépites (produits mis en avant)
 */
router.get("/phares", getFeatured);

/**
 * @route   GET /api/produits/nouveaux
 * @desc    Récupérer les derniers produits ajoutés
 */
router.get("/nouveaux", getNew);

/**
 * @route   GET /api/produits/categorie/:categorie
 * @desc    Récupérer les produits d'une catégorie spécifique
 */
router.get("/categorie/:categorie", getByCategory);

// --- ROUTES GÉNÉRIQUES ---

/**
 * @route   GET /api/produits
 * @desc    Récupérer tous les produits
 */
router.get("/", getAll);

/**
 * @route   GET /api/produits/:id
 * @desc    Récupérer un produit par son numéro_produit
 * @note    Placée en dernier pour ne pas intercepter "/phares" ou "/nouveaux"
 */
router.get("/:id", getById);

module.exports = router;