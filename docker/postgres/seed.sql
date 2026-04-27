-- Usuario inicial para desarrollo Docker (solo se ejecuta al crear el volumen nuevo).
-- Login: usuario "demo", contraseña "SammDocker2026"
-- Para otro usuario, registra desde /register en la app.

INSERT INTO users (username, name, rol, pass)
VALUES (
  'demo',
  'Usuario Demo Docker',
  'admin',
  '$2b$08$GoIKH/RfKGMl8Sts5yNK8.W9Sz5VpIGyL1G5aHymL2pOJktR2OGIi'
)
ON CONFLICT (username) DO NOTHING;
