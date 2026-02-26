const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// --- IMPORTS INTERNES ---
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
            description: "Documentation interactive de l'API E-commerce Caf'Thé réalisée à la Fabrique du Numérique",
            contact: { name: "Elo" }
        },
        servers: [
            { 
                url: process.env.NODE_ENV === 'production' 
                    ? process.env.VITE_API_URL 
                    : `http://localhost:${process.env.PORT || 3000}`,
                description: "Serveur local"
            }
        ],
    },
    // Utilisation de path.join pour garantir que Swagger trouve les fichiers
    apis: [
        path.join(__dirname, "./client/routes/*.js"),
        path.join(__dirname, "./produit/routes/*.js"),
        path.join(__dirname, "./commande/routes/*.js")
    ], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- 2. MIDDLEWARES GLOBAUX ---
app.use(cors({
    origin: '*', 
    credentials: true
}));
app.use(cookieParser()); 
app.use(express.json()); 
app.use(morgan("dev")); 

// --- 3. FICHIERS STATIQUES ---
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- 4. ROUTES DE L'API ---
app.use("/api/produits", produitRoutes);
app.use("/api/clients", clientRoutes); 
app.use("/api/commandes", commandeRoutes);

// Route de diagnostic
app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        message: "L'API Caf'Thé est opérationnelle",
        documentation: "/api-docs"
    });
});

// --- 5. GESTION DES ERREURS ---
app.use((req, res) => {
    res.status(404).json({ error: "Ressource non trouvée", path: req.originalUrl });
});

app.use((err, req, res, next) => {
    console.error("❌ ERREUR SERVEUR :", err.stack);
    res.status(500).json({ 
        message: "Une erreur interne est survenue sur le serveur.",
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

// --- 6. LANCEMENT ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur Caf'Thé démarré sur le port ${PORT}`);
    console.log(`📖 Documentation Swagger : http://localhost:${PORT}/api-docs`);
});