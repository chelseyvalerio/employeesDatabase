const mysql = require('mysql2');
require('dotenv').config()


const connection = mysql.createConnection({
    host: '127.0.0.1',
    // port: 8080,
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'employee_db'
}
);
console.log(connection)


module.exports= connection