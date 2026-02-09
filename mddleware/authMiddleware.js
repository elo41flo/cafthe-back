// Midlware d'authentification JWT
// Vérifie que le token JWT est valide pour protéger les routes

const jwt = require("jsonwebtoken");

// Vérification du token
const verifyToken = (req, res, next) => {
    // Récupérer le header d'Authorization
    const authHeader = req.headers["authorization"]

    if (!authHeader){
        return res.status(403).json({
            message: "Token manquant",
        });
    }

    // Le format attendu, c'est "Bearer <token>"
    const parts = authHeader.splits(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer"){
        return res.status(403).json({
            message: "Format de token invalide",
        });
    }

    const token = parts[1];

    // Vérifier le token 
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            if (err.name === "TokenExpiredError"){
                return res.status(401).json({
                    message: "Token expiré",
                });
            }

            return res.status(401).json({
                message: "Token invalide",
            });
        }

        // Token valide : on ajoute les infos du client à la requête
        req.client = decoded;
        next();
    });
};

module.exports = { verifyToken };