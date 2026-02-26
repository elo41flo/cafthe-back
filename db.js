const mysql = require("mysql2");
const fs = require("fs");
require('dotenv').config();

// Création du pool de connexions
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4' // Important pour les émojis et les accents (Caf'Thé !)
});

// Passage en mode Promise pour utiliser async/await dans tes models
const db = pool.promise();

/**
 * --- LE DÉTECTEUR DE SANTÉ (Health Check) ---
 * On teste la connexion immédiatement au lancement du serveur
 */
db.getConnection()
    .then(connection => {
        const logMsg = `✅ [${new Date().toLocaleString()}] Connexion MariaDB réussie sur ${process.env.DB_NAME}\n`;
        console.log(logMsg);
        fs.appendFileSync("debug_log.txt", logMsg);
        connection.release();
    })
    .catch(err => {
        const errMsg = `❌ [${new Date().toLocaleString()}] ERREUR CRITIQUE SQL : ${err.message} (Code: ${err.code})\n`;
        console.error(errMsg);
        // On écrit l'erreur dans le fichier pour débugger sur Plesk
        fs.appendFileSync("debug_log.txt", errMsg);
    });

module.exports = db;