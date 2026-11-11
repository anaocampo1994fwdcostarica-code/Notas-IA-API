require('dotenv').config(); // PRIMERA línea: carga las variables de .env antes que todo

const app = require('./app');

const PORT = process.env.PORT || 3000;

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor listo. Documentación en http://localhost:${PORT}/api-docs`);
});
