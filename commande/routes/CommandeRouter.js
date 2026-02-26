const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post("/register-order", async (req, res) => {
    // Ton code de transaction ici (garde-le tel quel)
    res.json({ message: "Route commande active" });
});

module.exports = router;