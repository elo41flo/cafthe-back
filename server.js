const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const db = require('./db'); 
const produitRoutes = require("./produit/routes/ProduitRouter");
const clientRoutes = require("./client/routes/ClientRouter");

const app = express();

// --- 1. CONFIGURATION DU CORS (SIMPLIFIÉE POUR DÉBLOQUER) ---
app.use(cors({
    origin: true, // Accepte dynamiquement l'origine qui appelle (débloque tout)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// --- 2. MIDDLEWARES ---
app.use(cookieParser()); 
app.use(express.json()); 
app.use(morgan("dev"));

// --- 3. IMAGES ---
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- 4. ROUTES ---
app.use("/api/produits", produitRoutes);
app.use("/api/clients", clientRoutes); 

app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "L'API Cafthé est opérationnelle" });
});

// --- 5. GESTION DES ERREURS ---
app.use((req, res, next) => {
    res.status(404).json({ error: "Route non trouvée", path: req.originalUrl });
});

app.use((err, req, res, next) => {
    console.error("❌ ERREUR SERVEUR :", err.stack);
    res.status(500).json({ message: "Une erreur interne est survenue." });
});

// --- 6. LANCEMENT (FORCÉ SUR LOCALHOST) ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`-------------------------------------------`);
    console.log(`✅ Serveur prêt !`);
    console.log(`➜ Local: http://localhost:${PORT}`);
    console.log(`➜ Network: http://127.0.0.1:${PORT}`);
    console.log(`-------------------------------------------`);
});