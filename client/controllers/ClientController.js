// Controleur client
const { 
    findClientByEmail, 
    hashPassword, 
    createClient, 
    comparePassword
} = require("../models/ClientModel");
const jwt = require("jsonwebtoken");

// Inscription
const register = async (req, res) => {
    try {
        const { nom_client, prenom_client, email_client, mdp_client } = req.body;

        // Vérifier si l'email existe déjà
        const existingClient = await findClientByEmail(email_client);

        if( existingClient.length > 0){
            return res.status(400).json({
                message: "Cet email est déjà utilisé",
            });
        }

        // Hacher le mot de passe
        const hash = await hashPassword(mdp_client);

        // Créer le client
        const result = await createClient({
            nom_client,
            prenom_client,
            email_client,
            mdp_client: hash,
        });

        res.status(201).json({
            message: "Inscription réussie",
            client_id: result.insertId,
            client: { nom_client, prenom_client, email_client },
        });

    } catch (error) {
        console.error("Erreur inscription", error.message);
        res.status(500).json({
            message: "Erreur lors de l'inscription",
        });
    }
};

// Connexion
const login = async (req, res) => {
    try {
        const { email_client, mdp_client } = req.body;

        // Rechercher le client
        const utilisateur = await findClientByEmail(email_client);
        if(utilisateur.length === 0){
            return res.status(401).json({
                message: "Identifiants incorrects",
            });
        }

        const client = utilisateur[0];

        // Vérifier le mot de passe
        const isMatch = await comparePassword(mdp_client, client.mdp_client)

        if (!isMatch){
            return res.status(401).json({
                message: "Identifiants incorrects",
            });
        }

        //  Générer le token JWT
        // AGATHE
        // Expire en secondes
        const expire = parseInt(process.env.JWT_EXPRESS_IN, 10) || 3600;
        const token = jwt.sign(
            {
                id: client.id_client, 
                email: client.email_client,
            },
            process.env.JWT_SECRET,
            // AGATHE
            {expiresIn: expire},
        );

        // AGATHE
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Mettre sur true en HTTPS
            sameSite: "lax",
            maxAge: expire * 1000,
        });

        res.json({
            message: "Connexion réussie",
            token,
            client: {
                id: client.id_client,
                nom: client.nom_client,
                prenom: client.prenom_client,
            },
        });
    } catch (error){
        console.error("Erreur de connexion utilisateur", error.message);
        res.status(500).json({
            message: "Erreur lors de la connexion",
        });
    }
};

// Fonction de deconnexion
// AGATHE
const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false, // Mettre sur true en HTTPS
        sameSite: "lax"
    });
    res.json({ message: "Déconnexion réussie" });
};

// AGATHE

// Automatiquement, le navigateur envoie le cookie
// le middleware vérifie le JWT
// Si le token est valide, on retourne les infos du clients
const getMe = async (req, res) => {
    try {
        // req.client.id vient du JWT decode par le middleware verifyToken
        const clients = await findClientById(req.client.id);

        if (clients.length === 0) {
            return res.status(404).json({ message: "Client introuvable" });
        }

        const client = clients[0];

        res.json({
            client: {
                id: client.id_client,
                nom: client.nom_client,
                prenom: client.prenom_client,
                email: client.email_client
            }
        });
    } catch (error) {
        console.error("Erreur /me:", error.message);
        res.status(500).json({ message: "Erreur lors de la vérification de session" });
    }
};

module.exports = { register, login, logout, getMe }; // AGATHE