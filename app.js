const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Imports des fichiers internes
const db = require('./db'); 
const produitRoutes = require("./produit/routes/ProduitRouter");
const clientRoutes = require("./client/routes/ClientRouter");
const commandeRoutes = require("./commande/routes/CommandeRouter");

const app = express();

// --- 1. CONFIGURATION SWAGGER (Documentation API) ---
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: "API Caf'Thé - Blois",
            version: '1.0.0',
            description: "Documentation interactive de l'API E-commerce Caf'Thé",
            contact: { name: "Elo - La Fabrique du Numérique" }
        },
        servers: [
            { 
                url: process.env.NODE_ENV === 'production' 
                    ? 'https://ton-api-deployee.com' 
                    : `http://localhost:${process.env.PORT || 3000}`,
                description: "Serveur principal"
            }
        ],
    },
    // Chemin vers tes fichiers de routes pour extraire la doc
    apis: ["./produit/routes/*.js", "./client/routes/*.js", "./commande/routes/*.js"], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- 2. CONFIGURATION DU CORS ---
app.use(cors({
    origin: '*', // À restreindre à ta Vercel plus tard pour la sécurité
    credentials: true
}));

// --- 3. MIDDLEWARES ---
app.use(cookieParser()); 
app.use(express.json()); 
app.use(morgan("dev"));  

// --- 4. IMAGES STATIQUES ---
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- 5. ROUTES ---
// Diagnostic logs
console.log("--- Diagnostic des Routers ---");
console.log("1. ProduitRouter type:", typeof produitRoutes);
console.log("2. ClientRouter type:", typeof clientRoutes);
console.log("3. CommandeRouter type:", typeof commandeRoutes);

app.use("/api/produits", produitRoutes);
app.use("/api/clients", clientRoutes); 
app.use("/api/commandes", commandeRoutes);

// Route de diagnostic (Health Check)
app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        message: "L'API Caf'Thé est en ligne",
        documentation: "/api-docs"
    });
});

// --- 6. GESTION DES ERREURS ---
app.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée", path: req.originalUrl });
});

app.use((err, req, res, next) => {
    console.error("❌ ERREUR SERVEUR :", err.stack);
    res.status(500).json({ 
        message: "Une erreur interne est survenue sur le serveur Caf'Thé.",
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

// --- 7. LANCEMENT ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur Caf'Thé démarré sur le port ${PORT}`);
    console.log(`📖 Documentation disponible sur http://localhost:${PORT}/api-docs`);
});