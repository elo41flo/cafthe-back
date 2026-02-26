const express = require("express");
const router = express.Router();
const { 
    registerOrder, 
    getMyOrders, 
    getOrderItems 
} = require("../controllers/OrderController");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/orders/create
 * @desc    Enregistrer une nouvelle commande (et gérer l'abonnement si besoin)
 * @access  Privé (nécessite un token)
 */
router.post("/create", verifyToken, registerOrder);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Récupérer toutes les commandes du client connecté pour son historique
 * @access  Privé (nécessite un token)
 */
router.get("/my-orders", verifyToken, getMyOrders);

/**
 * @route   GET /api/orders/:orderId/items
 * @desc    Récupérer les produits d'une commande spécifique (pour le détail)
 * @access  Privé (nécessite un token)
 */
router.get("/:orderId/items", verifyToken, getOrderItems);

module.exports = router;