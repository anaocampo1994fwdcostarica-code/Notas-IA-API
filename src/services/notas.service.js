const { AppError } = require('../utils/errors');

// "Base de datos" en memoria: se borra cada vez que se reinicia el servidor
const notas = [];
let nextId = 1; // id que recibirá la próxima nota

// Devuelve todas las notas
function listar() {
  return notas;
}

// Busca una nota por id; si no existe lanza un error 404
function buscar(id) {
  const nota = notas.find((n) => n.id === id);
  if (!nota) throw new AppError(404, 'Nota no encontrada');
  return nota;
}

// Crea una nota nueva y la devuelve
function crear({ titulo, contenido }) {
  const nota = {
    id: nextId++,
    titulo,
    contenido,
    creadaEn: new Date().toISOString(),
  };
  notas.push(nota);
  return nota;
}

// Actualiza solo los campos que vengan (titulo y/o contenido)
// Usa buscar() para obtener el 404 si no existe
function actualizar(id, datos) {
  const nota = buscar(id);
  if (datos.titulo !== undefined) nota.titulo = datos.titulo;
  if (datos.contenido !== undefined) nota.contenido = datos.contenido;
  return nota;
}

// Elimina una nota; usa buscar() para obtener el 404 si no existe
function eliminar(id) {
  const nota = buscar(id);
  notas.splice(notas.indexOf(nota), 1);
}

module.exports = { listar, buscar, crear, actualizar, eliminar };
