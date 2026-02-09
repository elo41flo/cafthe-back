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
        const { nom_client, prenom_client, email, mdp_client } = req.body;

        // Vérifier si l'email existe déjà
        const existingClient = await findClientByEmail(email);

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
            email,
            mdp_client: hash,
        });

        res.status(201).json({
            message: "Inscription réussie",
            client_id: result.insertId,
            client: { nom_client, prenom_client, email },
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
        const { email, mdp_client } = req.body;

        // Rechercher le client
        const utilisateur = await findClientByEmail(email);
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
        const token = jwt.sign(
            {
                id: client.id_client, 
                email: client.email,
            },
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
        );

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
            message: "Erruer lors de la connexion",
        });
    }
};

module.exports = { register, login };