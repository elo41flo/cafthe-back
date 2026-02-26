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
// On autorise tout pour le développement, mais sur Plesk tu pourras restreindre à ton domaine Vercel
app.use(cors({
    origin: '*', // Tu pourras remplacer par ['https://cafthe.vercel.app'] plus tard
    credentials: true
}));

// --- 2. MIDDLEWARES ---
app.use(cookieParser()); 
app.use(express.json()); // Permet de lire le JSON envoyé depuis le front (React)
app.use(morgan("dev"));  // Affiche les logs des requêtes dans ton terminal Plesk

// --- 3. IMAGES STATIQUES ---
// Si tu mets tes images de produits sur le serveur backend
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- 4. ROUTES ---
// --- TEST DE DIAGNOSTIC ---
console.log("1. ProduitRouter type:", typeof produitRoutes);
console.log("2. ClientRouter type:", typeof clientRoutes);
console.log("3. CommandeRouter type:", typeof commandeRoutes);

// Ton code actuel qui crash
app.use("/api/produits", produitRoutes); // Ligne 34
app.use("/api/clients", clientRoutes); 
app.use("/api/commandes", commandeRoutes);

// Route de diagnostic (Health Check)
app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        message: "L'API Caf'Thé est en ligne",
        db_status: db ? "Connectée" : "Déconnectée"
    });
});

// --- 5. GESTION DES ERREURS ---

// Erreur 404 (Si on tape une mauvaise URL)
app.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée", path: req.originalUrl });
});

// Erreur 500 (Le "crash" sécurisé)
app.use((err, req, res, next) => {
    console.error("❌ ERREUR SERVEUR :", err.stack);
    res.status(500).json({ 
        message: "Une erreur interne est survenue sur le serveur Caf'Thé.",
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

// --- 6. LANCEMENT ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Serveur Caf'Thé démarré sur le port ${PORT}`);
});