const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../env/.env'),
  quiet: true,
});

const { Pool } = require('pg');

function logConnectionError(err) {
  console.error('El error de conexion es:', err.message || err);
  if (err.code) console.error('  codigo:', err.code);
  if (err.errors && Array.isArray(err.errors)) {
    err.errors.forEach((e, i) => {
      console.error(`  causa [${i}]:`, e.code || '', e.message || e);
    });
  }
  if (err.code === 'ECONNREFUSED' || err.errors?.some((e) => e.code === 'ECONNREFUSED')) {
    console.error(
      '  → No hay Postgres escuchando en DB_HOST:DB_PORT. Si usas Docker en tu PC, suele ser DB_HOST=localhost y DB_PORT=35417 (puerto publicado en docker-compose), no uses el nombre de host "postgres" fuera de la red Docker.'
    );
  }
  if (err.code === 'ENOTFOUND' || err.errors?.some((e) => e.code === 'ENOTFOUND')) {
    console.error(
      '  → DB_HOST no resuelve (ENOTFOUND). Si ejecutas la app en el host (npm start), DB_HOST debe ser "localhost", no "postgres".'
    );
  }
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.code, err.message);
});

pool
  .connect()
  .then((client) => {
    client.release();
    console.log('Conexion OK BD (PostgreSQL)');
  })
  .catch((err) => {
    logConnectionError(err);
  });

module.exports = pool;
