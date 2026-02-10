const express = require("express");
const { register, login, logout, getMe } = require("../controllers/ClientController");
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

module.exports = router;