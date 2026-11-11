// Límite alto ANTES de importar app, para que el rate limit no interfiera
process.env.RATE_LIMIT_IA = '1000';

// Simulamos claude.service: estas pruebas nunca llaman a la IA real
jest.mock('../src/services/claude.service', () => ({
  preguntar: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app'); // app, no index.js: no se abre ningún puerto

// Ayudante: crea una nota nueva y la devuelve (cada prueba crea la suya)
async function crearNota(datos = { titulo: 'Nota de prueba', contenido: 'Contenido de prueba' }) {
  const res = await request(app).post('/api/notas').send(datos);
  return res.body;
}

describe('CRUD de notas', () => {
  test('GET /api/notas responde 200 con un arreglo', async () => {
    const res = await request(app).get('/api/notas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/notas válido responde 201 con id', async () => {
    const res = await request(app)
      .post('/api/notas')
      .send({ titulo: 'Mi nota', contenido: 'Hola mundo' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ titulo: 'Mi nota', contenido: 'Hola mundo' });
    expect(typeof res.body.id).toBe('number');
  });

  test('POST /api/notas con {} responde 400', async () => {
    const res = await request(app).post('/api/notas').send({});
    expect(res.status).toBe(400);
    expect(res.body.errores).toBeDefined();
  });

  test('GET /api/notas/:id de una nota existente responde 200', async () => {
    const nota = await crearNota();
    const res = await request(app).get(`/api/notas/${nota.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(nota.id);
  });

  test('GET /api/notas/99 responde 404', async () => {
    const res = await request(app).get('/api/notas/99');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Nota no encontrada' });
  });

  test('PUT /api/notas/:id responde 200 y cambia solo lo enviado', async () => {
    const nota = await crearNota({ titulo: 'Original', contenido: 'Texto original' });
    const res = await request(app).put(`/api/notas/${nota.id}`).send({ titulo: 'Editada' });
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Editada');
    expect(res.body.contenido).toBe('Texto original'); // no se envió, no cambia
  });

  test('PUT /api/notas/:id con {} responde 400', async () => {
    const nota = await crearNota();
    const res = await request(app).put(`/api/notas/${nota.id}`).send({});
    expect(res.status).toBe(400);
  });

  test('PUT /api/notas/99 responde 404', async () => {
    const res = await request(app).put('/api/notas/99').send({ titulo: 'X' });
    expect(res.status).toBe(404);
  });

  test('DELETE responde 204 y luego GET responde 404', async () => {
    const nota = await crearNota();
    const borrar = await request(app).delete(`/api/notas/${nota.id}`);
    expect(borrar.status).toBe(204);

    const buscar = await request(app).get(`/api/notas/${nota.id}`);
    expect(buscar.status).toBe(404);
  });
});
