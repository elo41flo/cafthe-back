const express = require('express');
const app = express();

app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Le serveur de base fonctionne" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Test sur port ${PORT}`);
});