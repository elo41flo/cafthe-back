const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');

/**
 * CONNEXION
 */
router.post("/login", ClientController.login);

/**
 * ÉTAPE 1 : VÉRIFIER L'EXISTENCE DE L'EMAIL
 * Utilisé par ForgotPassword.jsx (Step 1)
 */
router.post("/check-email", ClientController.checkEmail);

/**
 * ÉTAPE 2 : RÉINITIALISER LE MOT DE PASSE
 * Utilisé par ForgotPassword.jsx (Step 2)
 */
router.put("/reset-password", ClientController.resetPassword);

module.exports = router;