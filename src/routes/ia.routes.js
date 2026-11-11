const { Router } = require('express');
const { z } = require('zod');
const claude = require('../services/claude.service');
const validar = require('../middlewares/validar');

const router = Router();

// Reglas de validación para la pregunta
const preguntaSchema = z.object({
  pregunta: z.string().min(3).max(2000),
});

/**
 * @openapi
 * /api/ia/preguntar:
 *   post:
 *     tags: [IA]
 *     summary: Envía una pregunta al modelo de IA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pregunta'
 *     responses:
 *       200:
 *         description: Respuesta del modelo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaIA'
 *       400:
 *         description: Pregunta inválida (no se llama a la IA)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Límite de uso de la IA alcanzado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       502:
 *         description: Error del proveedor de IA
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       503:
 *         description: IA saturada o no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// validar va ANTES del handler: si la pregunta es inválida, la IA nunca se llama
router.post('/preguntar', validar(preguntaSchema), async (req, res) => {
  const { respuesta, uso } = await claude.preguntar(req.body.pregunta);
  res.status(200).json({ respuesta, uso });
});

module.exports = router;
