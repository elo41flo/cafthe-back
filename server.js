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
// CORS = Cross-Origin Ressource Sharing
// OBLIGATOIRE sinon le navigateur bloque les requêtes
// Test agressif : on autorise tout pour éliminer la piste du blocage pur
app.use(cors());

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
// Commente temporairement l'import de la BDD et des routes qui l'utilisent
// const db = require('./db'); 
// const produitRoutes = require("./produit/routes/ProduitRouter");

// Laisse juste la route health
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Test sans BDD réussi" });
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
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});