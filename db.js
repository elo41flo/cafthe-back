// Permet de configurer le pool de connexion à MySQL
// pour faire des requêtes asynchrones async/await

const mysql = require("mysql2/promise");
require('dotenv').config();

// Pool de connexions
// Permet de gérer plusieurs connexions simultanées
// Réutiliser des connexions existantes
// Gestion automatique de la disponibilité
// Limite le nb de connexion (en même temps)

const db = mysql.createPool({
    // Paramètre de connexion (host, nom d'utilisateur, mot de passe, nom de la bdd)
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // Paramètres du POOL
    // Si plus de connexion dispo, alors elles attendent
    waitForConnections: true,

    // Limiter le nombre max de connexion
    connectionLimit: 10,

    // Paramètres optionnels mais recommandés
    // En cas d'échec de connexion, réessayer
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    // Timeout de connexion (millisecondes)
    connectTimeout: 10000, // 10 secondes
});

(async () => {
    try {
        const connection = await db.getConnection();
        console.log("Connecté à la base de données MySQL");
        // Se déconnecte
        connection.release();
    // ... (garde tout le début du fichier identique)

    } catch (err) {
        console.error("❌ ERREUR DE CONNEXION :");
        console.error("- CODE :", err.code); // Affiche la cause technique (ex: ECONNREFUSED)
        console.error("- MESSAGE :", err.sqlMessage || err.message);

        // Arrête l'application proprement
        process.exit(1);
    }
})()

module.exports = db;