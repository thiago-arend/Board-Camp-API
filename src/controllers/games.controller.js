import { db } from "../database/database.connection.js";

export async function createGame(req, res) {
    const { name, image, stockTotal, pricePerDay } = req.body;

    try {
        const result = await db.query(`SELECT * FROM games WHERE name=$1;`, [name]);
        if (result.rowCount === 1) return res.status(409).send("Nome do jogo em uso!");

        await db.query(
            `INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4);`,
                [name, image, stockTotal, pricePerDay]
        );

        res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function getGames(req, res) {

    try {
        const result = await db.query(`SELECT * FROM games;`);

        res.send(result.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
}