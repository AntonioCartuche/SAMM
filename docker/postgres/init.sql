-- Schema SAMM (PostgreSQL). Tabla users: login en columna username (equivalente al campo user del formulario).

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  rol VARCHAR(255),
  pass TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS proyecto (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
