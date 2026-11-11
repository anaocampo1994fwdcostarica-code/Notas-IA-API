// Límite alto ANTES de importar app, para que el rate limit no interfiera
process.env.RATE_LIMIT_IA = '1000';

// Simulamos claude.service: la IA real NUNCA se llama (no se gastan créditos)
jest.mock('../src/services/claude.service', () => ({
  preguntar: jest.fn(),
}));

const request = require('supertest');
const Anthropic = require('@anthropic-ai/sdk');
const app = require('../src/app');
const claude = require('../src/services/claude.service'); // es la versión simulada

const RESPUESTA_FALSA = {
  respuesta: 'texto de prueba',
  uso: { input_tokens: 1, output_tokens: 1 },
};

beforeEach(() => {
  // Antes de cada prueba: borra el historial de llamadas y fija la respuesta falsa
  claude.preguntar.mockReset();
  claude.preguntar.mockResolvedValue(RESPUESTA_FALSA);
});

describe('POST /api/ia/preguntar', () => {
  test('pregunta válida responde 200 con respuesta y uso', async () => {
    const res = await request(app).post('/api/ia/preguntar').send({ pregunta: '¿Qué es REST?' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(RESPUESTA_FALSA);
    expect(claude.preguntar).toHaveBeenCalledWith('¿Qué es REST?');
  });

  test('pregunta "a" responde 400 y NO llama a la IA', async () => {
    const res = await request(app).post('/api/ia/preguntar').send({ pregunta: 'a' });
    expect(res.status).toBe(400);
    expect(claude.preguntar).not.toHaveBeenCalled();
  });
});

describe('POST /api/notas/:id/resumen', () => {
  test('nota inexistente responde 404 y NO llama a la IA', async () => {
    const res = await request(app).post('/api/notas/99/resumen');
    expect(res.status).toBe(404);
    expect(claude.preguntar).not.toHaveBeenCalled();
  });

  test('nota existente responde 200 y usa el system del resumen', async () => {
    // Creamos la nota dentro de la prueba (no dependemos del orden)
    const { body: nota } = await request(app)
      .post('/api/notas')
      .send({ titulo: 'Express', contenido: 'Express es un framework de Node.js.' });

    const res = await request(app).post(`/api/notas/${nota.id}/resumen`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ notaId: nota.id, resumen: 'texto de prueba' });
    expect(claude.preguntar).toHaveBeenCalledWith(
      'Express es un framework de Node.js.',
      'Resume el texto en 3 viñetas breves, en español.'
    );
  });
});

describe('Errores de la IA', () => {
  test('un 401 del proveedor responde 502 IA_NO_DISPONIBLE sin el mensaje original', async () => {
    const MENSAJE_SECRETO = 'invalid x-api-key SECRETO_DEL_PROVEEDOR';
    // Simulamos que el SDK lanza un error 401 (llave inválida)
    claude.preguntar.mockRejectedValue(
      Anthropic.APIError.generate(
        401,
        { type: 'error', error: { type: 'authentication_error', message: MENSAJE_SECRETO } },
        MENSAJE_SECRETO,
        new Headers()
      )
    );
    // Silenciamos el console.error del errorHandler para no ensuciar la salida
    const espia = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).post('/api/ia/preguntar').send({ pregunta: 'Hola, ¿cómo estás?' });

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'IA_NO_DISPONIBLE' });
    expect(res.text).not.toContain('SECRETO_DEL_PROVEEDOR'); // el detalle NO llega al cliente
    expect(espia).toHaveBeenCalled(); // pero sí se registró en el servidor

    espia.mockRestore();
  });
});
