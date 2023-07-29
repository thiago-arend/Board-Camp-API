import { db } from "../database/database.connection.js";
import dayjs from "dayjs";

export async function createRental(req, res) {
    const { customerId, gameId, daysRented } = req.body;

    try {
        const game = await db.query("SELECT * FROM games WHERE id=$1;", [gameId]);
        if (game.rowCount === 0) return res.status(400).send("Id do jogo é inválido!");

        const customer = await db.query("SELECT * FROM customers WHERE id=$1;", [customerId]);
        if (customer.rowCount === 0) return res.status(400).send("Id do cliente é inválido!");

        const totalAlugueisAberto = await db.query(`SELECT * FROM rentals WHERE "gameId"=$1 AND "returnDate" IS NULL;`, [gameId]);
        if (totalAlugueisAberto.rowCount >= game.rows[0].stockTotal) return res.status(400).send("Não há jogos disponíveis para aluguel.");

        const originalPrice = daysRented * game.rows[0].pricePerDay;
        const rentDate = dayjs().format("YYYY-MM-DD");
        const values = [customerId, gameId, rentDate, daysRented, null, originalPrice, null];
        await db.query(
            `INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
            VALUES ($1, $2, $3, $4, $5, $6, $7);`, values);

        res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function getRentals(req, res) {

    try {
        const result = await db.query(
            `SELECT r.*, c.name AS customer, g.name AS game
                FROM rentals r
                    JOIN customers c ON c.id=r."customerId"
                    JOIN games g ON g.id=r."gameId";`
        );

        const rentalsObjArr = result.rows.map((r) => {
            r.customer = {id: r.customerId, name: r.customer};
            r.game = {id: r.gameId, name: r.game};

            return r;
        });

        res.send(rentalsObjArr);
    } catch (error) {
        res.status(500).send(error.message);
    }
}