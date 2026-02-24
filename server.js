const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Vérification de la connexion BDD (db.js doit être à la racine)
const db = require('./db'); 

// --- IMPORT DES ROUTES ---
// Note : J'utilise les chemins que tu as créés sur Plesk. 
// Assure-toi que les majuscules correspondent exactement aux noms de tes dossiers !
const produitRoutes = require("./produit/routes/ProduitRouter");
const clientRoutes = require("./client/routes/ClientRouter");
const commandeRoutes = require("./commande/routes/CommandeRouter");

const app = express();

// --- 1. CONFIGURATION DU CORS ---
app.use(cors({
    origin: "https://cafthe.vercel.app", // L'URL de ton front Vercel
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// --- 2. MIDDLEWARES ---
app.use(cookieParser()); 
app.use(express.json()); 
app.use(morgan("dev"));

// --- 3. GESTION DES IMAGES ---
// Cette ligne permet d'accéder à tes images via https://ton-api.com/images/nom-image.webp
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- 4. ROUTES ---
app.use("/api/produits", produitRoutes);
app.use("/api/clients", clientRoutes); 
app.use("/api/commandes", commandeRoutes);

// Route de test pour vérifier si le serveur répond
app.get("/", (req, res) => {
    res.json({ message: "Bienvenue sur l'API Caf'Thé !" });
});

app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "L'API Caf'Thé est opérationnelle sur Plesk" });
});

// --- 5. GESTION DES ERREURS ---
// Erreur 404 (Route non trouvée)
app.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée", path: req.originalUrl });
});

// Erreur 500 (Erreur serveur)
app.use((err, req, res, next) => {
    console.error("❌ ERREUR SERVEUR :", err.stack);
    res.status(500).json({ 
        message: "Une erreur interne est survenue.",
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

// --- 6. LANCEMENT ---
// Sur Plesk, on ne force pas l'IP '0.0.0.0', on laisse le serveur gérer le port.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Serveur Caf'Thé démarré sur le port ${PORT}`);
});