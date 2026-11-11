const Anthropic = require('@anthropic-ai/sdk');
const { AppError } = require('../utils/errors');

// Middleware de errores: Express lo reconoce porque tiene 4 parámetros.
// Debe registrarse AL FINAL en app.js para atrapar los errores de todas las rutas.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // 1) Errores nuestros (por ejemplo 404 'Nota no encontrada')
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  // 2) Errores del proveedor de IA (DeepSeek vía SDK de Anthropic)
  if (err instanceof Anthropic.APIError) {
    // El detalle solo se muestra en la consola del servidor, nunca al cliente
    console.error('Error de la IA:', err.status, err.message);

    let status = 502; // Bad Gateway: el servicio externo falló
    if (err.status === 429) status = 429; // demasiadas solicitudes / sin saldo
    else if (err.status === 503 || err.status === 529) status = 503; // servicio saturado

    // NUNCA reenviamos err.message: podría revelar detalles internos
    return res.status(status).json({ error: 'IA_NO_DISPONIBLE' });
  }

  // 3) El cliente envió un JSON mal escrito (lo detecta express.json())
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  // 4) Cualquier otro error inesperado
  console.error(err);
  return res.status(500).json({ error: 'Error interno' });
}

module.exports = errorHandler;
