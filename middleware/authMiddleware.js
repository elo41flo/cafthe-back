const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    let token = null;

    // 1. Vérification du Header Authorization (format: Bearer <token>)
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    // 2. Vérification des Cookies (si cookie-parser est installé sur ton serveur Express)
    if (!token && req.cookies) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: "Accès refusé : Badge (token) manquant" });
    }

    // 3. Vérification du JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Accès refusé : Badge invalide ou expiré" });
        }
        
        // On attache les infos à req.client ET req.user pour être compatible avec tous tes controllers
        const clientId = decoded.id || decoded.id_client || decoded.numero_client;
        
        if (!clientId) {
            return res.status(401).json({ message: "Badge corrompu : ID client introuvable" });
        }

        req.client = { id: clientId };
        req.user = { id: clientId }; // Doublon de sécurité pour tes autres fichiers
        
        next();
    });
};

module.exports = { verifyToken };