import { db } from "../database/database.connection.js";

export async function createGame(req, res) {
    const { name, image, stockTotal, pricePerDay } = req.body;

    try {
        const resultSelectGame = await db.query(`SELECT * FROM games WHERE name=$1;`, [name]);
        const gameExists = resultSelectGame.rowCount === 1; 
        
        if (gameExists) return res.status(409).send("Nome do jogo em uso!");

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
        const gamesArray = await db.query(`SELECT * FROM games;`);

        res.send(gamesArray.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
}