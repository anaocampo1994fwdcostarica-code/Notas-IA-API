# Laboratorio #5: API REST con Express y Swagger integrando la Claude API

**Autora:** Ana Ocampo
**Repositorio:** https://github.com/anaocampo1994fwdcostarica-code/Notas-IA-API

API REST de notas hecha con Express 5 y documentada con Swagger. Permite crear, listar, consultar y eliminar notas, hacer preguntas a un modelo de IA y resumir notas en 3 viñetas.

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
| DELETE | `/api/notas/:id` | Elimina una nota | 204, 404 |
| POST | `/api/notas/:id/resumen` | Resume una nota en 3 viñetas con IA | 200, 404, 429, 502, 503 |
| POST | `/api/ia/preguntar` | Envía una pregunta a la IA | 200, 400, 429, 502, 503 |

## Capturas

### Pregunta a la IA
![Pregunta a la IA](docs/pregunta.png)

### Resumen de una nota
![Resumen de una nota](docs/resumen.png)

### API key falsa (error controlado)
![API key falsa](docs/key-falsa.png)

## Experimentos con `system`

| # | Prompt de `system` | Pregunta | Observación |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

## Reflexión

**1. ¿Por qué la API key no puede estar en el frontend?**

_Respuesta:_

**2. ¿Qué responde la API cuando el modelo devuelve 401 y por qué no se reenvía el mensaje original?**

_Respuesta:_

**3. ¿Cuál es la diferencia entre `system` y `messages`?**

_Respuesta:_

**4. ¿Cuántos tokens usaron dos de tus llamadas y qué parámetro limita el costo?**

_Respuesta:_

**5. ¿Qué pasaría si no se validara el body?**

_Respuesta:_

**6. ¿Tuviste conflictos de Git? ¿Cómo los resolviste o cómo los evitaste?**

_Respuesta:_
