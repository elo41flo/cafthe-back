const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Imports des fichiers internes
const db = require('./db'); 
const produitRoutes = require("./produit/routes/ProduitRouter");
const clientRoutes = require("./client/routes/ClientRouter");
const commandeRoutes = require("./commande/routes/CommandeRouter");

const app = express();

// --- 1. CONFIGURATION DU CORS ---
// On accepte ton front Vercel explicitement
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// --- 2. MIDDLEWARES ---
app.use(cookieParser()); 
app.use(express.json()); 
app.use(morgan("dev"));

// --- 3. IMAGES STATIQUES ---
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- 4. ROUTES ---
app.use("/api/produits", produitRoutes);
app.use("/api/clients", clientRoutes); 
app.use("/api/commandes", commandeRoutes);

// Route de test pour vérifier que l'API respire
app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        message: "L'API Cafthé est opérationnelle",
        timestamp: new Date()
    });
});

// --- 5. GESTION DES ERREURS ---
// Erreur 404 (Route non trouvée)
app.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée", path: req.originalUrl });
});

// Erreur 500 (Erreur serveur)
app.use((err, req, res, next) => {
    console.error("❌ ERREUR SERVEUR :", err.stack);
    res.status(500).json({ message: "Une erreur interne est survenue." });
});

// --- 6. LANCEMENT ---
// TRÈS IMPORTANT : On laisse Plesk choisir le port via process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});