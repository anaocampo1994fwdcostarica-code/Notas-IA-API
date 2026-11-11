const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const notasRoutes = require('./routes/notas.routes');
const iaRoutes = require('./routes/ia.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Convierte el body JSON de las peticiones en un objeto (req.body)
app.use(express.json());

/**
 * @openapi
 * /api-docs:
 *   get:
 *     tags: [Docs]
 *     summary: Interfaz de Swagger UI con la documentación
 *     responses:
 *       200:
 *         description: Página HTML de la documentación
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API
app.use('/api/notas', notasRoutes);
app.use('/api/ia', iaRoutes);

// El manejador de errores va AL FINAL, después de todas las rutas
app.use(errorHandler);

module.exports = app;
