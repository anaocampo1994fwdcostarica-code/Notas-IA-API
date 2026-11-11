# Laboratorio #5: API REST con Express y Swagger integrando la Claude API

**Autora:** Ana Ocampo
**Rol:** Desarrolladora única (trabajo individual): diseño, código, documentación y pruebas.
**Repositorio:** https://github.com/anaocampo1994fwdcostarica-code/Notas-IA-API

API REST de notas hecha con Express 5 y documentada con Swagger. Permite crear, listar, consultar, editar y eliminar notas, hacer preguntas a un modelo de IA y resumir notas en 3 viñetas.

## Proveedor de IA

En lugar de Claude uso **DeepSeek**, a través de su endpoint compatible con la API de Anthropic (`https://api.deepseek.com/anthropic`). Por eso el código usa el SDK oficial `@anthropic-ai/sdk` y `client.messages.create`. Para cambiar de proveedor solo hay que cambiar `ANTHROPIC_BASE_URL`, `ANTHROPIC_API_KEY` y `CLAUDE_MODEL` en el archivo `.env`.

## Tecnologías

- Node.js (CommonJS) y Express 5
- Zod (validación)
- swagger-jsdoc y swagger-ui-express (documentación)
- @anthropic-ai/sdk (cliente de IA)
- dotenv y nodemon

## Instalación y ejecución

```bash
git clone https://github.com/anaocampo1994fwdcostarica-code/Notas-IA-API.git
cd Notas-IA-API
npm install
```

Copia el archivo de ejemplo y escribe tu API key en `.env`:

```bash
# PowerShell
Copy-Item .env.example .env
# Git Bash / Linux / macOS
cp .env.example .env
```

Inicia el servidor en modo desarrollo:

```bash
npm run dev
```

Abre la documentación en: http://localhost:3000/api-docs

## Variables de entorno

| Variable | Descripción |
|---|---|
| `ANTHROPIC_BASE_URL` | URL del endpoint compatible con Anthropic (DeepSeek) |
| `ANTHROPIC_API_KEY` | API key del proveedor de IA (**nunca se sube a Git**) |
| `CLAUDE_MODEL` | Nombre del modelo que se usa |
| `PORT` | Puerto del servidor |

## Endpoints

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| GET | `/api-docs` | Documentación Swagger UI | 200 |
| GET | `/api/notas` | Lista todas las notas | 200 |
| GET | `/api/notas/:id` | Obtiene una nota | 200, 404 |
| POST | `/api/notas` | Crea una nota | 201, 400 |
| PUT | `/api/notas/:id` | Actualiza una nota (título y/o contenido) | 200, 400, 404 |
| DELETE | `/api/notas/:id` | Elimina una nota | 204, 404 |
| POST | `/api/notas/:id/resumen` | Resume una nota en 3 viñetas con IA | 200, 404, 429, 502, 503 |
| POST | `/api/ia/preguntar` | Envía una pregunta a la IA | 200, 400, 429, 502, 503 |

## Experimentos con `system`

Cambié el texto de `system` del endpoint de resumen (`POST /api/notas/1/resumen`) y comparé las respuestas usando la misma nota.

| # | Prompt de `system` | Endpoint | Observación |
|---|---|---|---|
| 1 | Resume el texto en 3 viñetas breves, en español. | `/api/notas/1/resumen` | Devolvió 3 viñetas cortas en español, una idea por viñeta. |
| 2 | Resume el texto en una frase. | `/api/notas/1/resumen` | Devolvió una sola oración que resume la nota, sin viñetas. |
| 3 | Traduce al inglés. | `/api/notas/1/resumen` | Ya no resumió: devolvió el contenido de la nota traducido al inglés. Solo cambiando el `system`, cambió la tarea completa. |

## Reflexión

**1. ¿Por qué la API key no puede estar en el frontend?**

_Respuesta:_ Todo lo que se envía al navegador lo puede ver cualquier usuario. Si la API key estuviera en el código del frontend, bastaría con abrir las herramientas de desarrollador (F12) y buscarla en la pestaña **Sources**, o en la pestaña **Network** dentro de las cabeceras de la petición a la IA. Con esa clave, otra persona podría hacer llamadas a mi nombre y gastar mi saldo. Por eso la clave solo vive en el archivo `.env` del backend, que está en `.gitignore`, y el cliente únicamente habla con mi API.

**2. ¿Qué responde la API cuando el modelo devuelve 401 y por qué no se reenvía el mensaje original?**

_Respuesta:_ Mi API responde **502** con `{ "error": "IA_NO_DISPONIBLE" }`. Lo comprobé poniendo una llave falsa en `.env`: Swagger mostró el 502 y en la terminal del servidor apareció el 401 real. No reenvío el 401 porque ese error significa que *mi servidor* no pudo autenticarse con DeepSeek; el cliente no hizo nada mal, así que un 401 lo confundiría (pensaría que él debe iniciar sesión). Además, el mensaje original puede revelar detalles de mi cuenta o de mi configuración. Por eso el detalle se queda en la consola del servidor y al cliente le llega un mensaje genérico. El código 502 (Bad Gateway) indica que el problema vino de un servicio externo.

**3. ¿Cuál es la diferencia entre `system` y `messages`?**

_Respuesta:_ `system` son las **instrucciones de comportamiento** del modelo: su rol, el idioma, el formato o las reglas. `messages` es la **conversación**, es decir, lo que dice el usuario. Por ejemplo, en el resumen el `system` es "Resume el texto en 3 viñetas breves, en español." y en `messages` va el contenido de la nota. Al cambiar solo el `system` a "Traduce al inglés.", con la misma nota, la respuesta cambió por completo (ver la tabla de experimentos). Separarlos hace que el comportamiento sea más predecible.

**4. ¿Cuántos tokens usaron dos de tus llamadas y qué parámetro limita el costo?**

_Respuesta:_

| Llamada | input_tokens | output_tokens |
|---|---|---|
| `POST /api/ia/preguntar` — "Explica qué es un JSON en dos líneas" | 52 | 114 |
| `POST /api/ia/preguntar` — "¿Qué es REST?" | 47 | 1024 |

Los `input_tokens` son lo que entra al modelo (el `system` más la pregunta) y los `output_tokens` son lo que responde. El parámetro **`max_tokens`** (1024 en mi código) limita el tamaño máximo de la respuesta y, con eso, el costo de salida. Lo comprobé con la pregunta "¿Qué es REST?": la respuesta llegó exactamente a 1024 tokens y se cortó en el límite, así que no pudo gastar más. Además, la validación con Zod (`max(2000)` en la pregunta) limita el costo de entrada.

**5. ¿Qué pasaría si no se validara el body?**

_Respuesta:_
- **Se gastaría dinero en peticiones inútiles:** preguntas vacías o sin sentido llegarían a la IA y consumirían tokens.
- **El costo podría dispararse:** alguien podría enviar textos enormes y cada llamada costaría mucho más.
- **Los errores serían confusos:** datos con el tipo incorrecto (por ejemplo, un número en vez de texto) llegarían al SDK y fallarían como un 502 de la IA, en lugar de un 400 claro que le diga al cliente qué corregir.
- **Se guardarían datos incorrectos:** en el CRUD se podrían crear notas sin título o sin contenido.

**6. ¿Tuviste conflictos de Git? ¿Cómo los resolviste o cómo los evitaste?**

_Respuesta:_ Hice el laboratorio sola, así que no hubo conflictos de *merge* entre compañeros. Trabajé en la rama `ana`, con commits pequeños por etapa, y la integré a `main` con un pull request, por lo que no se tocaron los mismos archivos en dos ramas a la vez. Sí tuve un problema importante al inicio: creé el repositorio con el `.gitignore` vacío y se subieron `node_modules` y el archivo `.env` con mi API key. Lo resolví anulando esa clave en DeepSeek y creando una nueva, borrando el repositorio y volviéndolo a crear, y escribiendo el `.gitignore` **antes** del primer commit. Aprendí a revisar siempre `git status` antes de cada `git add`.