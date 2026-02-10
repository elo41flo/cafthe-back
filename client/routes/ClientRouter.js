const express = require("express");
const { register, login, logout, getMe } = require("../controllers/ClientController");
const router = express.Router();
// AGATHE 
const { verifyToken } = require("../middlewares/authMiddleware"); 

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
 * @desc    Vérification de session (Route protégée)
 */
// AGATHE : 
// AGATHE : 
router.get("/me", verifyToken, getMe);

/**
 * @route   POST /api/clients/logout
 * @desc    Déconnexion (Route protégée)
 */
// AGATHE : 
router.post("/logout", verifyToken, logout);

// AGATHE : 
// AGATHE : 

module.exports = router;