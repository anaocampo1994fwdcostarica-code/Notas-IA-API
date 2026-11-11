const { rateLimit } = require('express-rate-limit');

// Máximo de peticiones por minuto a las rutas que usan IA.
// Se lee de .env al crear el limitador (por defecto 5).
const maximo = Number(process.env.RATE_LIMIT_IA) || 5;

// Limitador para las rutas que llaman a la IA (cuidan el saldo).
// Cuenta las peticiones por IP; las dos rutas comparten el mismo contador.
const rateLimitIA = rateLimit({
  windowMs: 60 * 1000,     // ventana de 1 minuto
  limit: maximo,           // peticiones permitidas en esa ventana
  standardHeaders: true,   // envía las cabeceras RateLimit-* (cuántas quedan, cuándo se reinicia)
  legacyHeaders: false,    // no envía las cabeceras antiguas X-RateLimit-*
  // Respuesta cuando se supera el límite (la IA NO se llama)
  handler: (req, res) => {
    res.status(429).json({ error: 'DEMASIADAS_PETICIONES' });
  },
});

module.exports = rateLimitIA;
