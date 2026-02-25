const express = require("express");
const { 
    register, 
    login, 
    logout, 
    getMe, 
    updateProfile,
    updateAddress, 
    updatePassword,
    resetPassword,
    getMyOrders,
    getOrderItems,
    deleteAccount // <-- Nouvelle fonction à ajouter dans ton ClientController
} = require("../controllers/ClientController");

const router = express.Router();
const { verifyToken } = require("../../middleware/authMiddleware");

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
 * @desc    Récupérer les infos du client connecté
 */
router.get("/me", verifyToken, getMe);

/**
 * @route   POST /api/clients/logout
 */
router.post("/logout", verifyToken, logout);

// --- ROUTES DE MISE À JOUR (PRIVÉES) ---

/**
 * @route   PUT /api/clients/update-profile
 */
router.put("/update-profile", verifyToken, updateProfile);

/**
 * @route   PUT /api/clients/update-address
 */
router.put("/update-address", verifyToken, updateAddress);

/**
 * @route   PUT /api/clients/update-password
 */
router.put("/update-password", verifyToken, updatePassword);

// --- ROUTES HISTORIQUE & COMMANDES ---

/**
 * @route   GET /api/clients/my-orders
 */
router.get("/my-orders", verifyToken, getMyOrders);

/**
 * @route   GET /api/clients/orders/:orderId/items
 */
router.get("/orders/:orderId/items", verifyToken, getOrderItems);

// --- MOT DE PASSE OUBLIÉ (PUBLIQUE) ---

/**
 * @route   PUT /api/clients/reset-password
 */
router.put("/reset-password", resetPassword);

// --- ZONE DE DANGER (RGPD) ---

/**
 * @route   DELETE /api/clients/delete-me
 * @desc    Suppression définitive du compte client
 */
router.delete("/delete-me", verifyToken, deleteAccount);

module.exports = router;