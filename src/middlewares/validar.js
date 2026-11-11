// Middleware genérico de validación.
// Recibe un esquema de Zod y devuelve un middleware que revisa req.body.
const validar = (schema) => (req, res, next) => {
  // safeParse NO lanza excepciones: devuelve { success, data } o { success, error }
  const r = schema.safeParse(req.body ?? {});

  if (!r.success) {
    // Body inválido: respondemos 400 y NO seguimos (la IA nunca se llama)
    return res.status(400).json({ errores: r.error.issues });
  }

  // Body válido: lo reemplazamos por los datos limpios que devolvió Zod
  req.body = r.data;
  next();
};

module.exports = validar;
