const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import de la connexion BDD
const db = require('./db');

// Import des routes
const produitRoutes = require("./produit/routes/ProduitRouter");
const clientRoutes = require("./client/routes/ClientRouter");

const app = express();

// --- MIDDLEWARES DE BASE ---
app.use(express.json()); // Pour lire le body des requêtes POST (JSON)
app.use(morgan("dev"));  // Pour voir les logs des requêtes dans le terminal

// --- CONFIGURATION DU CORS ---
// Permet au Front-end (port 5173) de parler au Back-end (port 3000)
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// --- SERVIR LES IMAGES ---
// Rend le dossier public/images accessible via http://localhost:3000/images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- DÉCLARATION DES ROUTES API ---
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "L'API Cafthé est opérationnelle" });
});

// Utilisation des routeurs (Correction : ajout du 's' à clients)
app.use("/api/produits", produitRoutes);
app.use("/api/clients", clientRoutes);

// --- GESTION DES ERREURS ---

// 1. Erreur 404 : Si aucune route ne correspond
app.use((req, res, next) => {
    res.status(404).json({
        error: "Route non trouvée",
        path: req.originalUrl
    });
});

// 2. Erreur 500 : Erreur globale du serveur (évite que l'app crash sans message)
app.use((err, req, res, next) => {
    console.error("Erreur serveur :", err.stack);
    res.status(500).json({
        message: "Une erreur interne est survenue sur le serveur.",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
    console.log(`-------------------------------------------`);
    console.log(`✅ Serveur démarré sur http://${HOST}:${PORT}`);
    console.log(`🚀 Mode: ${process.env.NODE_ENV || 'développement'}`);
    console.log(`-------------------------------------------`);
});