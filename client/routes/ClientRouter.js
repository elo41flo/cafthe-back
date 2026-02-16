const express = require("express");
const { 
    register, 
    login, 
    logout, 
    getMe, 
    updateProfile,      // Nouvelle fonction à ajouter au controller
    updateAddress,      // Nouvelle fonction à ajouter au controller
    updatePassword      // Nouvelle fonction à ajouter au controller
} = require("../controllers/ClientController");
const router = express.Router();
const path = require("path"); // AGATHE

// AGATHE 
const { verifyToken } = require("../../mddleware/authMiddleware");

/**
 * @route   POST /api/clients/register
 */
router.post("/register", register);

/**
 * @route   POST /api/clients/login
 */
router.post("/login", login);

/**
 * @route   GET /api/clients/me
 */
// AGATHE
router.get("/me", verifyToken, getMe);

/**
 * @route   POST /api/clients/logout
 */
// AGATHE
router.post("/logout", verifyToken, logout);

// --- NOUVELLES ROUTES POUR "MON COMPTE" ---

/**
 * @route   PUT /api/clients/update-profile
 * @desc    Mise à jour des infos (nom, prénom, tel)
 */
router.put("/update-profile", verifyToken, updateProfile);

/**
 * @route   PUT /api/clients/update-address
 * @desc    Mise à jour de l'adresse de livraison
 */
router.put("/update-address", verifyToken, updateAddress);

/**
 * @route   PUT /api/clients/update-password
 * @desc    Changement sécurisé du mot de passe
 */
router.put("/update-password", verifyToken, updatePassword);

module.exports = router;