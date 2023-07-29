import { db } from "../database/database.connection.js";

export async function createCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;

    try {
        const result = await db.query(`SELECT * FROM customers WHERE cpf=$1;`, [cpf]);
        if (result.rowCount === 1) return res.status(409).send("CPF em uso!");

        await db.query(
            `INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);`,
            [name, phone, cpf, birthday]
        );

        res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function getCustomers(req, res) {

    try {
        const result = await db.query(`SELECT * FROM customers;`);

        res.send(result.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function getCustomer(req, res) {
    const { id } = req.params;

    try {
        const result = await db.query(`SELECT * FROM customers WHERE id=$1;`, [id]);
        if (result.rowCount === 0) return res.status(404).send("O cliente não existe!");

        res.send(result.rows[0]);

    } catch (error) {
        res.status(500).send(error.message);
    }
}