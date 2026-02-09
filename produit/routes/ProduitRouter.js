// Router Articles
// chemin : /api/produit

const express = require("express");
const path = require("path");
const { getAll, getById, getByCategory } = require("../controller/ProduitController");
// const { verifyToken } = require(path.join(process.cwd(), 'middleware', 'authMiddleware'));
// Temporairement, pour tester
const verifyToken = (req, res, next) => { next(); };
const router = express.Router();

// GET /api/produit - Récupérer tous les produits
router.get("/", getAll);

// GET /api/produit/:id - Récuupérer un article par son ID
router.get("/:id", getById);

// GET /api/produit/:categorie - Récupérer les articles d'une catégorie
router.get("/categorie/:categorie", getByCategory);

module.exports = router;