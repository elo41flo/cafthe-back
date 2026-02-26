const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');

/**
 * @swagger
 * /api/clients/login:
 * post:
 * summary: Connexion
 * tags: [Clients]
 * responses:
 * 200:
 * description: OK
 */
router.post("/login", ClientController.login);

module.exports = router;