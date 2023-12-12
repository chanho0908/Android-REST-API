const mysql = require("mysql2/promise");

const dbConnect = async () => {
    try {
        const connection = await mysql.createConnection({
            host: "mysql",
            user: "root",
            password: "root",
            database: "cloudbridge_database",
        });

        console.log("mysql connection success");
    } catch (error) {
        console.log(error);
    }
};

dbConnect();
// const express = require('express')
// const app = express()
// const port = 3000;

// app.get('/', (req, res) => {
//   res.send('Docker with nodejs')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })
