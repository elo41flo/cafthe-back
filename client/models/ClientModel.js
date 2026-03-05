const db = require("../../db");
const bcrypt = require("bcryptjs");

/**
 * Récupère un client par son ID
 */
const findClientById = async (id) => {
    const [rows] = await db.query("SELECT * FROM client WHERE numero_client = ?", [id]);
    return rows[0];
};

/**
 * Récupère un client par son Email
 */
const findClientByEmail = async (email) => {
    const [rows] = await db.query("SELECT * FROM client WHERE email_client = ?", [email]);
    return rows[0];
};

/**
 * Crée un nouveau client
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
 * AJOUT : Définit le mot de passe d'un client existant (Cas Magasin)
 * On cherche par email et on met à jour le champ mdp_client
 */
const updateClientPassword = async (email, hashedMdp) => {
    const [result] = await db.query(
        "UPDATE client SET mdp_client = ? WHERE email_client = ?",
        [hashedMdp, email]
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
 * Modifié pour gérer le cas où le hash est NULL (Client Magasin)
 */
const comparePassword = async (password, hash) => {
    // Si pas de hash en base, la comparaison est impossible
    if (!password || !hash) return false;
    return await bcrypt.compare(password, hash);
};

module.exports = {
    findClientByEmail,
    createClient,
    hashPassword,
    comparePassword,
    findClientById,
    updateClientPassword // On n'oublie pas de l'exporter
};