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
                    ? process.env.VITE_API_URL // URL de prod (Render, VPS, etc.)
                    : `http://localhost:${process.env.PORT || 3000}`,
                description: "Serveur de développement"
            }
        ],
    },
    // Recherche les blocs @swagger dans tous tes fichiers de routes
    apis: ["./**/routes/*.js"], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- 2. MIDDLEWARES GLOBAUX ---
app.use(cors({
    origin: '*', // En production, tu pourras restreindre à ton URL Vercel
    credentials: true
}));
app.use(cookieParser()); 
app.use(express.json()); // Indispensable pour lire le corps des requêtes POST/PUT
app.use(morgan("dev"));  // Affiche les logs de requêtes dans la console

// --- 3. FICHIERS STATIQUES (Images produits) ---
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- 4. ROUTES DE L'API ---
app.use("/api/produits", produitRoutes);
app.use("/api/clients", clientRoutes); 
app.use("/api/commandes", commandeRoutes);

// Route de diagnostic (Health Check)
app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        message: "L'API Caf'Thé est opérationnelle",
        documentation: "/api-docs"
    });
});

// --- 5. GESTION DES ERREURS ---

// Gestion de la 404 (Route inexistante)
app.use((req, res) => {
    res.status(404).json({ error: "Ressource non trouvée", path: req.originalUrl });
});

// Gestion des erreurs serveurs (500)
app.use((err, req, res, next) => {
    console.error("❌ ERREUR SERVEUR :", err.stack);
    res.status(500).json({ 
        message: "Une erreur interne est survenue sur le serveur.",
        // On n'affiche le détail de l'erreur qu'en développement pour la sécurité
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

// --- 6. LANCEMENT DU SERVEUR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur Caf'Thé démarré sur le port ${PORT}`);
    console.log(`📖 Documentation Swagger : http://localhost:${PORT}/api-docs`);
});