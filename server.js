const mysql = require('mysql2');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util')
const app = express();

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));

const DB = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "0166751081",
    database: "nodepractice"
});

DB.connect(() => { console.log("MYSQL connected") })

const promiseQuery = util.promisify(DB.query).bind(DB)

app.get("/", (req, res) => {
    res.send("Server is Running POPO");
})

app.post("/createTable", async (req, res) => {
    try {
        const query = `CREATE TABLE testTwo (id INT AUTO_INCREMENT PRIMARY KEY , email VARCHAR(255), password VARCHAR(255), name VARCHAR(100), phone INT)`
        const result = await promiseQuery(query)
        res.json({ status: result })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: 'Server Error' })
    }
})

app.post("/register", async (req, res) => {
    try {
        const { email, password, name, phone } = req.body
        const salt = await bcrypt.genSalt(10)
        const encryptedPassword = await bcrypt.hash(password, salt)
        const query = `INSERT INTO users (email,password,name,phone) VALUES ?`
        const value = [[email, encryptedPassword, name, phone]]
        const result = await promiseQuery(query, [value])

        res.json({ status: result })

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: 'Server Error' })
    }
})

app.get("/getUsers", async (req, res) => {
    try {
        const query = `SELECT id, email , name , phone FROM users LIMIT 10 `
        const result = await promiseQuery(query)

        res.json({ data: result })

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: 'Server Error' })
    }
})

app.put("/updateUsers/:id", async (req, res) => {
    try {
        const userId = req.params.id
        const { name, phone } = req.body
        const updateField = {}

        console.log("name", name);
        if (name !== "" && name !== null && name !== undefined) updateField.name = name
        if (phone !== "" && phone !== null && phone !== undefined) updateField.phone = phone

        const updateQuery = `UPDATE users SET ` + Object.keys(updateField).map(key => `${key} = ?`).join(", ") + "WHERE id = " + userId;
        const parameters = [...Object.values(updateField), userId];
        await promiseQuery(updateQuery, parameters)

        const getQuery = `SELECT id, email , name , phone FROM users LIMIT 10 `
        const result = await promiseQuery(getQuery)

        res.json({ data: result })



    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: 'Server Error' })
    }
})

app.delete("/delete/:id", async (req, res) => {
    try {
        const userId = req.params.id
        const query = `DELETE FROM users WHERE id = ?`
        const value = [[userId]]

        await promiseQuery(query, value)

        const getQuery = `SELECT id, email , name , phone FROM users LIMIT 10 `
        const result = await promiseQuery(getQuery)

        res.json({ data: result })


    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: 'Server Error' })

    }
})

app.put("/alterTable", async (req, res) => {
    try {
        const query = `alter table users modify phone varchar(255)`
        const result = await promiseQuery(query)
        res.send(result)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: 'Server Error' })
    }
})



app.listen(process.env.PORT || 1117, () => { console.log('Server is running in 1117') })