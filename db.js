const mysql = require("mysql2/promise");
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306, // On force le format nombre
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z'
});

// Test de connexion simplifié : on ne bloque pas le démarrage du serveur
db.getConnection()
    .then(connection => {
        console.log("✅ Connexion MySQL établie avec succès !");
        connection.release();
    })
    .catch(err => {
        console.error("❌ ERREUR BDD (mais le serveur continue) :", err.message);
    });

module.exports = db;