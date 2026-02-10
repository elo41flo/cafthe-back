const mysql = require("mysql2/promise");
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z'
});

(async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ Connexion MySQL établie avec succès !");
        connection.release();
    } catch (err) {
        console.error("❌ ERREUR BDD :", err.message);
        process.exit(1);
    }
})();

module.exports = db;