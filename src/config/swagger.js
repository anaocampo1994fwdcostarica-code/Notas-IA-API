const swaggerJsdoc = require('swagger-jsdoc');

// Configuración de OpenAPI: datos generales + esquemas reutilizables.
// Los endpoints se leen de los comentarios @openapi de los archivos en "apis".
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lab 5: Notas + IA',
      version: '1.0.0',
      description: 'API REST de notas con Express y Swagger que usa un modelo de IA (DeepSeek, compatible con Anthropic).',
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      { name: 'Notas', description: 'CRUD de notas y resumen con IA' },
      { name: 'IA', description: 'Preguntas al modelo de IA' },
      { name: 'Docs', description: 'Documentación de la API' },
    ],
    components: {
      schemas: {
        // Lo que el cliente envía para crear una nota
        NotaInput: {
          type: 'object',
          required: ['titulo', 'contenido'],
          properties: {
            titulo: { type: 'string', minLength: 1, maxLength: 100, example: 'Clase de Express' },
            contenido: {
              type: 'string',
              minLength: 1,
              maxLength: 5000,
              example: 'Express es un framework de Node.js para crear APIs. Usa middlewares y rutas. Swagger documenta los endpoints.',
            },
          },
        },
        // Lo que el cliente envía para actualizar una nota (al menos un campo)
        NotaUpdate: {
          type: 'object',
          minProperties: 1,
          properties: {
            titulo: { type: 'string', minLength: 1, maxLength: 100, example: 'Clase de Express (editada)' },
            contenido: { type: 'string', minLength: 1, maxLength: 5000, example: 'Contenido actualizado de la nota.' },
          },
        },
        // Una nota guardada
        Nota: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            titulo: { type: 'string', example: 'Clase de Express' },
            contenido: { type: 'string', example: 'Express es un framework de Node.js...' },
            creadaEn: { type: 'string', format: 'date-time' },
          },
        },
        // Lo que el cliente envía para preguntar a la IA
        Pregunta: {
          type: 'object',
          required: ['pregunta'],
          properties: {
            pregunta: { type: 'string', minLength: 3, maxLength: 2000, example: '¿Qué es una API REST?' },
          },
        },
        // Respuesta de POST /api/ia/preguntar
        RespuestaIA: {
          type: 'object',
          properties: {
            respuesta: { type: 'string' },
            uso: {
              type: 'object',
              properties: {
                input_tokens: { type: 'integer', example: 20 },
                output_tokens: { type: 'integer', example: 150 },
              },
            },
          },
        },
        // Respuesta de POST /api/notas/{id}/resumen
        Resumen: {
          type: 'object',
          properties: {
            notaId: { type: 'integer', example: 1 },
            resumen: { type: 'string', example: '- Punto 1\n- Punto 2\n- Punto 3' },
          },
        },
        // Formato de los errores
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Nota no encontrada' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/app.js'],
};

module.exports = swaggerJsdoc(options);
