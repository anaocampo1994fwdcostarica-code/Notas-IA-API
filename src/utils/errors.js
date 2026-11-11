// Error "de la aplicación": además del mensaje, guarda el código HTTP (status)
// que queremos devolver al cliente. Ejemplo: new AppError(404, 'Nota no encontrada')
class AppError extends Error {
  constructor(status, message) {
    super(message);        // Error guarda el mensaje
    this.name = 'AppError';
    this.status = status;  // código HTTP que usará el errorHandler
  }
}

module.exports = { AppError };
