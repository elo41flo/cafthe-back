const db = require("../../db");
const bcrypt = require("bcryptjs");

/**
 * Récupère un client par son ID
 * Retourne l'objet client directement au lieu d'un tableau
 */
const findClientById = async (id) => {
    const [rows] = await db.query("SELECT * FROM client WHERE numero_client = ?", [id]);
    return rows[0]; // On retourne le premier résultat (ou undefined)
};

/**
 * Récupère un client par son Email
 * Utile pour la vérification lors du Login
 */
const findClientByEmail = async (email) => {
    const [rows] = await db.query("SELECT * FROM client WHERE email_client = ?", [email]);
    return rows[0]; // On retourne l'objet directement pour faciliter les tests
};

/**
 * Crée un nouveau client
 * On s'assure que les données sont bien présentes
 */
const createClient = async (data) => {
    const { nom_client, prenom_client, email_client, mdp_client } = data;
    
    const [result] = await db.query(
        "INSERT INTO client (nom_client, prenom_client, email_client, mdp_client) VALUES (?, ?, ?, ?)",
        [nom_client, prenom_client, email_client, mdp_client]
    );
    
    return result;
};

/**
 * Sécurise le mot de passe avant l'insertion en base
 */
const hashPassword = async (password) => {
    if (!password) throw new Error("Mot de passe manquant pour le hachage");
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/**
 * Compare le mot de passe saisi avec celui stocké en base
 */
const comparePassword = async (password, hash) => {
    if (!password || !hash) return false;
    return await bcrypt.compare(password, hash);
};

module.exports = { 
    findClientByEmail, 
    createClient, 
    hashPassword, 
    comparePassword, 
    findClientById 
};