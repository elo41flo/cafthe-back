const mysql = require("mysql2");
require('dotenv').config();

// On crée le pool en mode classique
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z'
});

// On le transforme en version "Promise" pour tes await/async dans les controllers
const db = pool.promise();

// Test de connexion rapide
db.getConnection()
    .then(connection => {
        console.log("✅ Connexion MySQL établie avec succès !");
        connection.release();
    })
    .catch(err => {
        console.error("❌ ERREUR BDD (le serveur continue quand même) :", err.message);
    });

module.exports = db;