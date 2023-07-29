import { db } from "../database/database.connection.js";

export async function createCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;

    try {
        const resultSelectCustomer = await db.query(`SELECT * FROM customers WHERE cpf=$1;`, [cpf]);
        const customerExists = resultSelectCustomer.rowCount === 1;
        
        if (customerExists) return res.status(409).send("CPF em uso!");

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
        const customersArray = await db.query(`SELECT * FROM customers;`);

        res.send(customersArray.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
}