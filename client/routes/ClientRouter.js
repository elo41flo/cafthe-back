const express = require("express");
const { register, login, logout } = require("../controllers/ClientController");
const router = express.Router();
const cookieParser = require("cookie-parser");
const cors = require("cors"); // AGATHE

// AGATHE
// Vérification de session du client
// Route protégée
// GET /api/clients/me
route.get("/me", verifyToken, getMe)

// Deconnexion
// Route protégée
// POST /api/clients/logout
router.post("/logout", logout)

// Configuration CORS corrigée (Frontend URL et méthodes)
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Correction ortho FRONTEND
    methods: ["GET", "POST", "PUT", "DELETE"], // Correction tableau de strings
    credentials: true // AGATHE
};

// Routes
router.post("/register", register);
router.post("/login", login);

module.exports = router;