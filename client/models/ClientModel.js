// Model client

const db = require("../../db");
const bcrypt = require ("bcryptjs");

// Rechercher un client par email
const findClientByEmail = async (email) => {
    const [rows] = await db.query("SELECT * FROM client WHERE email = ?",
        [email],
    );
    return rows;
};

// Créer un nouveau client
const createClient = async (clientData) => {
    const { 
        nom_client, 
        prenom_client, 
        email, 
        mdp_client, 
        adresse_facturation, 
        cp_facturation, 
        adresse_livraison, 
        cp_livraison, 
        telephone 
    } = clientData;

    const [result] = await db.query(
        'INSERT INTO client (nom_client, prenom_client, email, mdp_client,' +
        'adresse_facturation, cp_facturation,'+
        'adresse_livraison, cp_livraison,'+
        'telephone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            nom_client, 
            prenom_client, 
            email, 
            mdp_client, 
            adresse_facturation || null,
            cp_facturation || null,
            adresse_livraison || null,
            cp_livraison || null,
            telephone || null,
        ],
    );
    return result;
};

// Hacher un mot de passe 
const hashPassword = async (password) => {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    return await bcrypt.hash(password, rounds);
    // return await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
};

// Comparer un mot de passe
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = { findClientByEmail, createClient, hashPassword, comparePassword };