// Client router
// chemin : /api/client
const express = require("express");
const { register, login } = require ("../controllers/ClientController");
const router = express.Router();

// Inscription d'un client
// POST /api/client/register
// Body : { nom_client, prenom_client, email, mdp_client }
router.post("/register", register);

// Connexion d'un client
// POST /api/client/login
// Body : { email, mdp_client }
// Retourne un token JWT
router.post("/login", login);

module.exports = router;