const db = require("../../db");
const bcrypt = require("bcryptjs"); // Assure-toi que c'est bien bcryptjs dans package.json

const findClientById = async (id) => {
    const [rows] = await db.query("SELECT * FROM client WHERE numero_client = ?", [id]);
    return rows;
};

const findClientByEmail = async (email) => {
    const [rows] = await db.query("SELECT * FROM client WHERE email_client = ?", [email]);
    return rows;
};

const createClient = async (data) => {
    const { nom_client, prenom_client, email_client, mdp_client } = data;
    const [result] = await db.query(
        "INSERT INTO client (nom_client, prenom_client, email_client, mdp_client) VALUES (?, ?, ?, ?)",
        [nom_client, prenom_client, email_client, mdp_client]
    );
    return result;
};

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = { findClientByEmail, createClient, hashPassword, comparePassword, findClientById };