const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/OrderController");
const { verifyToken } = require("../middleware/authMiddleware"); // Vérifie bien le chemin vers ton middleware

// La route pour créer une commande
// On utilise verifyToken pour être sûr que le client est connecté
router.post("/create", verifyToken, createOrder);

module.exports = router;