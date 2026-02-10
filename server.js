const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser'); // AGATHE
require('dotenv').config();

// Import de la connexion BDD
const db = require('./db');

// Import des routes
const produitRoutes = require("./produit/routes/ProduitRouter");
const clientRoutes = require("./client/routes/ClientRouter");

const app = express();

// --- MIDDLEWARES DE BASE ---
app.use(express.json()); 
app.use(cookieParser()); // AGATHE
app.use(morgan("dev"));  

// --- CONFIGURATION DU CORS ---
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // AGATHE
}));

// --- SERVIR LES IMAGES ---
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- DÉCLARATION DES ROUTES API ---
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "L'API Cafthé est opérationnelle" });
});

app.use("/api/produits", produitRoutes);
app.use("/api/clients", clientRoutes); 

// --- GESTION DES ERREURS ---

app.use((req, res, next) => {
    res.status(404).json({
        error: "Route non trouvée",
        path: req.originalUrl
    });
});

app.use((err, req, res, next) => {
    console.error("Erreur serveur :", err.stack);
    res.status(500).json({
        message: "Une erreur interne est survenue.",
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