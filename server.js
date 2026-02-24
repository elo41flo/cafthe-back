const fs = require('fs');
const path = require('path');

// Ce bloc va créer un fichier "debug.txt" à la racine de ton site
try {
    const express = require('express');
    const app = express();

    app.get("/health", (req, res) => {
        res.json({ status: "OK" });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        fs.appendFileSync('debug.txt', `Démarrage réussi à ${new Date()}\n`);
    });
} catch (err) {
    // Si ça crash, l'erreur sera écrite ici
    fs.appendFileSync('debug.txt', `CRASH au démarrage : ${err.message}\n${err.stack}\n`);
}