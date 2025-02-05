require('dotenv').config();

const mysql = require('mysql2');

/*
const connection = mysql.createConnection({
  host: 'sammdb.mysql.database.azure.com',
  user: 'antonio',
  password: 'tonio689@',
  database: 'sammdb',
  port: 3306,
});

*/

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

connection.connect((error)=>{
    if(error){
        console.log('El error de conexion es :'+error);
        return;
    }
    console.log('Conexion OK BD');
});
module.exports = connection;


const express = require('express');
const app = express();

app.get('/test-db', (req, res) => {
    connection.ping((err) => {
        if (err) {
            res.status(500).send('No se pudo conectar a la base de datos');
        } else {
            res.send('Conexión exitosa a la base de datos');
        }
    });
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));