const express = require('express');
const cors = require('cors'); 


// Allows us to access the .env
require('dotenv').config();

const app = express();
const port = process.env.PORT;

const corsOptions = {
    origin: '*',
    credentials: true,  // access-control-allow-credentials:true
    optionSuccessStatus: 200,
}


app.use(cors(corsOptions));

app.get('/', function (req, res) {
    res.send({id: 1});
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
})