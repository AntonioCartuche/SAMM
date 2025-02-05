require('dotenv').config();
const sql = require('mssql');

// Configuración de la conexión para MS SQL Server en Azure
const config = {
    user: 'antonio', // Usuario de SQL Server
    password: 'tonio689@', // Contraseña
    server: 'sammdb.database.windows.net', // Host de Azure SQL Server
    database: 'sammdb', // Nombre de la base de datos
    port: 1433, // Puerto de SQL Server
    options: {
        encrypt: true, // Requerido para conexiones en Azure
        trustServerCertificate: false
    }
};

// Crear la conexión
const pool = new sql.ConnectionPool(config);

pool.connect()
    .then(() => console.log('Conexión a SQL Server en Azure OK'))
    .catch(err => console.log('Error de conexión:', err));

module.exports = pool;

// Servidor Express con ruta de prueba de conexión
const express = require('express');
const app = express();

app.get('/test-db', async (req, res) => {
    try {
        let result = await pool.request().query('SELECT 1 AS status');
        res.send('Conexión exitosa a la base de datos');
    } catch (err) {
        res.status(500).send('No se pudo conectar a la base de datos: ' + err);
    }
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
