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
    const { customerId, gameId, offset, limit, order, desc, status, startDate } = req.query;

    try {

        const result = await db.query(
            `SELECT r.*, c.name AS customer, g.name AS game
                FROM rentals r
                    JOIN customers c ON c.id=r."customerId"
                    JOIN games g ON g.id=r."gameId"`
                    + ((customerId && gameId) ? ` WHERE c.id=${customerId} AND g.id=${gameId}` : ``)
                    + (customerId ? ` WHERE c.id=${customerId}` : ``)
                    + (gameId ? ` WHERE g.id=${gameId}` : ``)
                    + ((gameId || customerId || startDate) && (status === "open") ? ` AND "returnDate" IS NULL` : ``)
                    + ((gameId || customerId || startDate) && (status === "closed") ? ` AND "returnDate" IS NOT NULL` : ``)
                    + ((!gameId && !customerId && !startDate) && (status === "open") ? ` WHERE "returnDate" IS NULL` : ``)
                    + ((!gameId && !customerId && !startDate) && (status === "closed") ? ` WHERE "returnDate" IS NOT NULL` : ``)
                    + ((gameId || customerId || status) && (startDate) ? ` AND "rentDate" >= '${startDate}'` : ``)
                    + ((!gameId && !customerId && !status) && (startDate) ? ` WHERE "rentDate" >= '${startDate}'` : ``)
                    + ((order) ? ` ORDER BY "${order}"` : ``)
                    + ((order && desc && desc === "true") ? ` DESC` : ``)
                    + ((offset) ? ` OFFSET ${offset}` : ``)
                    + ((limit) ? ` LIMIT ${limit}` : ``)
        );

        const rentalsObjArr = result.rows.map((r) => {
            r.customer = { id: r.customerId, name: r.customer };
            r.game = { id: r.gameId, name: r.game };

            return r;
        });

        res.send(rentalsObjArr);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function deleteRental(req, res) {
    const { id } = req.params;

    try {
        const finished = await db.query(`SELECT * FROM rentals WHERE id=$1 AND "returnDate" IS NULL;`, [id]);
        if (finished.rowCount === 1) return res.status(400).send("O jogo ainda não foi devolvido!");

        const result = await db.query("DELETE FROM rentals WHERE id=$1;", [id]);
        if (result.rowCount === 0) return res.status(404).send("Id não existe!");

        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function returnRental(req, res) {
    const { id } = req.params;

    try {
        const rentalIdExists = await db.query("SELECT * FROM rentals WHERE id=$1", [id]);
        if (rentalIdExists.rowCount === 0) return res.status(404).send("O aluguel selecionado não exise!");

        const rentalFinished = await db
            .query(`SELECT * FROM rentals WHERE id=$1 AND "returnDate" IS NOT NULL`, [id]);
        if (rentalFinished.rowCount === 1) return res.status(400).send("O aluguel selecionado já foi devolvido!");

        const rentalData = await db.query(
            `SELECT r."daysRented", r."rentDate", g."pricePerDay" FROM rentals r
                JOIN games g ON g.id=r."gameId"
                WHERE r.id=$1;`, [id]
        );

        let delayFee;
        const returnDate = dayjs().format("YYYY-MM-DD"); // today's date

        // atraso = diaEntrega - diaLocação - diasAlugados
        const diasAtraso = dayjs(returnDate).diff(rentalData.rows[0].rentDate, 'day')
            - rentalData.rows[0].daysRented;

        (diasAtraso > 0) ? delayFee = diasAtraso * rentalData.rows[0].pricePerDay : delayFee = 0;

        await db.query(`UPDATE rentals SET ("returnDate", "delayFee") = ($1, $2) WHERE id=$3;`,
            [returnDate, delayFee, id]);

        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
}