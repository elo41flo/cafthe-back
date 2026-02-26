const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');

/**
 * @swagger
 * tags:
 * name: Clients
 * description: Gestion des comptes clients
 */

// --- ROUTES ---

// Inscription
router.post("/register", ClientController.register);

// Connexion
router.post("/login", ClientController.login);

// Reset de mot de passe (L'appel PUT qui posait problème au début)
router.put("/reset-password", ClientController.resetPassword);

// Profil et autres (Nécessitent souvent un token)
router.get("/me", ClientController.getMe);
router.put("/update-profile", ClientController.updateProfile);
router.put("/update-password", ClientController.updatePassword);
router.delete("/delete-account", ClientController.deleteAccount);

// Déconnexion et Commandes
router.post("/logout", ClientController.logout);
router.get("/orders", ClientController.getMyOrders);

// ==========================================
// L'EXPORT CRUCIAL (SANS ACCOLADES)
// ==========================================
module.exports = router;