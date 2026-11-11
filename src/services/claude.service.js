// ÚNICO archivo del proyecto que usa el SDK de Anthropic.
// Usamos DeepSeek a través de su endpoint compatible con la API de Anthropic.
const Anthropic = require('@anthropic-ai/sdk');

// El cliente se crea UNA sola vez, cuando se carga el módulo.
// La API key se lee sola de process.env.ANTHROPIC_API_KEY (nunca se escribe en el código).
const client = new Anthropic({ baseURL: process.env.ANTHROPIC_BASE_URL });

// Envía un texto al modelo y devuelve { respuesta, uso }
// - texto: lo que pregunta el usuario (va en messages)
// - system: instrucciones de comportamiento para el modelo (opcional)
async function preguntar(texto, system) {
  const msg = await client.messages.create({
    model: process.env.CLAUDE_MODEL,      // el modelo se configura en .env
    max_tokens: 1024,                     // límite de tokens de salida (controla el costo)
    system: system ?? 'Eres un asistente útil. Responde en español.',
    messages: [{ role: 'user', content: texto }],
  });

  // La respuesta viene en bloques; tomamos el de tipo 'text'
  const bloque = msg.content.find((b) => b.type === 'text');

  return {
    respuesta: bloque ? bloque.text : '',
    uso: msg.usage, // tokens de entrada y salida
  };
}

module.exports = { preguntar };
