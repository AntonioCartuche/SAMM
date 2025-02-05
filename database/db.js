require('dotenv').config();

const mysql = require('mysql2');


const connection = mysql.createConnection({
    host: 'sammdb.mysql.database.azure.com',
    user: 'antonio',
    password: 'tonio689@',
    database: 'sammdb',
    port: 3306,
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