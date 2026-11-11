// Archivo propio con un límite BAJO: Jest carga los módulos de cada archivo
// por separado, así que aquí el limitador se crea con máximo 2.
process.env.RATE_LIMIT_IA = '2';

// Simulamos claude.service: la IA real nunca se llama
jest.mock('../src/services/claude.service', () => ({
  preguntar: jest.fn().mockResolvedValue({
    respuesta: 'texto de prueba',
    uso: { input_tokens: 1, output_tokens: 1 },
  }),
}));

const request = require('supertest');
const app = require('../src/app');
const claude = require('../src/services/claude.service');

describe('Rate limit de las rutas de IA', () => {
  test('con límite 2, la tercera petición responde 429 sin llamar a la IA', async () => {
    const enviar = () => request(app).post('/api/ia/preguntar').send({ pregunta: '¿Qué es REST?' });

    const r1 = await enviar();
    const r2 = await enviar();
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r2.headers['ratelimit-limit']).toBe('2'); // cabecera estándar
    expect(r2.headers['ratelimit-remaining']).toBe('0');

    const r3 = await enviar();
    expect(r3.status).toBe(429);
    expect(r3.body).toEqual({ error: 'DEMASIADAS_PETICIONES' });
    expect(claude.preguntar).toHaveBeenCalledTimes(2); // la tercera no llegó a la IA

    // El contador es compartido: el resumen también queda bloqueado
    const resumen = await request(app).post('/api/notas/1/resumen');
    expect(resumen.status).toBe(429);
  });

  test('las rutas que no usan IA no tienen límite', async () => {
    const res = await request(app).get('/api/notas');
    expect(res.status).toBe(200);
  });
});
