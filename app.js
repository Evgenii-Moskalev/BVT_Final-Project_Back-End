const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');


// Allows us to access the .env
require('dotenv').config();

const app = express();
const port = process.env.PORT;

const corsOptions = {
    origin: '*',
    credentials: true,  // access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_name
});

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(async (req, res, next) => {
    try {
        req.db = await pool.getConnection();
        req.db.connection.config.namedPlaceholders = true;

        await req.db.query('SET SESSION sql_mode = "TRADITIONAL"');
        await req.db.query(`SET time_zone = '-8:00'`);
        await next();

        req.db.release();
        // console.log('connection');
    } catch (err) {
        // If anything downstream throw an error, we must release the connection allocated for the request
        console.log(err)
        // If an error occurs, disconnects from the database
        if (req.db) req.db.release();
        throw err;
    }
});

app.post('/register', async function (req, res) {
    try {
        let encryptedUser;

        await bcrypt.hash(req.body.password, 10).then(async hash => {
            try {
                console.log('HASHED PASSWORD', hash);

                const [user] = await req.db.query(`
               INSERT INTO users (userName, userPassword)
               VALUES (:username, :password);
               `, {
                    username: req.body.username,
                    password: hash
                });

                console.log('USER', user);
            } catch (error) {
                console.log('error', error);
            }
        })
    } catch (err) {
        console.log('err', err);
        res.json({ err });
    }
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
})