const { Router } = require('express');
const { z } = require('zod');
const notas = require('../services/notas.service');
const claude = require('../services/claude.service');
const validar = require('../middlewares/validar');

const router = Router();

// Reglas de validación para crear una nota
const notaSchema = z.object({
  titulo: z.string().min(1).max(100),
  contenido: z.string().min(1).max(5000),
});

/**
 * @openapi
 * /api/notas:
 *   get:
 *     tags: [Notas]
 *     summary: Lista todas las notas
 *     responses:
 *       200:
 *         description: Lista de notas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Nota'
 */
router.get('/', (req, res) => {
  res.status(200).json(notas.listar());
});

/**
 * @openapi
 * /api/notas/{id}:
 *   get:
 *     tags: [Notas]
 *     summary: Obtiene una nota por su id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Nota encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *       404:
 *         description: Nota no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (req, res) => {
  // Los parámetros de la URL llegan como texto: los convertimos a número
  const nota = notas.buscar(Number(req.params.id));
  res.status(200).json(nota);
});

/**
 * @openapi
 * /api/notas:
 *   post:
 *     tags: [Notas]
 *     summary: Crea una nota
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotaInput'
 *     responses:
 *       201:
 *         description: Nota creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validar(notaSchema), (req, res) => {
  const nota = notas.crear(req.body);
  res.status(201).json(nota); // 201 = recurso creado
});

/**
 * @openapi
 * /api/notas/{id}:
 *   delete:
 *     tags: [Notas]
 *     summary: Elimina una nota
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Nota eliminada (sin contenido)
 *       404:
 *         description: Nota no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', (req, res) => {
  notas.eliminar(Number(req.params.id));
  res.status(204).end(); // 204 = éxito sin cuerpo de respuesta
});

/**
 * @openapi
 * /api/notas/{id}/resumen:
 *   post:
 *     tags: [Notas]
 *     summary: Resume una nota en 3 viñetas usando la IA
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resumen generado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resumen'
 *       404:
 *         description: Nota no encontrada (no se llama a la IA)
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
router.post('/:id/resumen', async (req, res) => {
  // Primero buscamos la nota: si no existe, se lanza 404 y la IA NO se llama
  const nota = notas.buscar(Number(req.params.id));

  // En Express 5 los errores de funciones async llegan solos al errorHandler
  const { respuesta } = await claude.preguntar(
    nota.contenido,
    'Resume el texto en 3 viñetas breves, en español.'
  );

  res.status(200).json({ notaId: nota.id, resumen: respuesta });
});

module.exports = router;
