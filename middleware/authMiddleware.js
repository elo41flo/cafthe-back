const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    let token = null;

    // 1. On vérifie les headers (Bearer Token)
    if (req.headers["authorization"]) {
        token = req.headers["authorization"].split(" ")[1];
    }

    // 2. On vérifie les cookies si le header est vide
    if (!token && req.cookies) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: "Badge manquant" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Badge invalide" });
        }
        
        // IMPORTANT : On attache l'ID pour que le controller puisse faire sa requête SQL
        // On vérifie si c'est .id ou .id_client (selon ton login)
        req.client = { id: decoded.id || decoded.id_client };
        next();
    });
};

module.exports = { verifyToken };