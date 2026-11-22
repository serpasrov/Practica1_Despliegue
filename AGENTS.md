# Reglas de arquitectura y estilo para la API REST de Eventos

## 1. Descripción del proyecto

API RESTful construida con Node.js, Express y Mongoose que gestiona las entradas a un conjunto de eventos y los recintos donde se celebran. Base de datos MongoDB llamada `eventos` (en local y, en producción, MongoDB Atlas). La aplicación se desplegará en Render.

## 2. Estructura de carpetas obligatoria

Respetar estrictamente esta estructura (está prohibido crear carpetas como `controllers/`, `services/`, `src/`, etc.):

- `models/evento.js` (esquemas de evento y entrada, modelo `eventos`)
- `models/recinto.js` (esquema y modelo `recintos`)
- `routes/eventos.js` (enrutador de eventos y entradas)
- `routes/recintos.js` (enrutador de recintos)
- `index.js` (punto de entrada)
- `.env` (variables de entorno: `PORT` y `MONGODB_URI` como mínimo)
- `package.json` (con `"type": "module"` y script `start`: `node index.js`)
- `.gitignore` (incluir `node_modules/` y `.env`)

## 3. Modelos de datos

Los nombres de los campos deben respetarse exactamente (mayúsculas/minúsculas incluidas).

### 3.1. Recinto (`models/recinto.js`)

- **nombre**: `String`, `required`, `minlength: 5`, `trim`.
- **direccion**: `String`, `required`, `minlength: 10`, `trim`.
- **localidad**: `String`, `required`, `minlength: 3`, `trim`.
- **aforoMaximo**: `Number`, no obligatorio.

Crear y exportar (export default) el modelo `recintos`: `mongoose.model('recintos', recintoSchema)`.

### 3.2. Entrada (subdocumento, en `models/evento.js`)

- **tipo**: `String`, `required`, `minlength: 3`, `trim` (ej. "VIP", "General").
- **precio**: `Number`, `required`, `min: 0`.
- **disponibles**: `Number`, `required`, `min: 0`, entero (validar con `Number.isInteger`).

### 3.3. Evento (`models/evento.js`)

- **nombre**: `String`, `required`, `minlength: 5`, `trim`.
- **fecha**: `Date`, `required`.
- **entradas**: array de subdocumentos `[entradaSchema]`.
- **recinto**: `mongoose.Schema.Types.ObjectId`, `ref: 'recintos'`, `required`.

Crear y exportar (export default) el modelo `eventos`: `mongoose.model('eventos', eventoSchema)`.

## 4. Estilo de código y convenciones

- **Módulos**: ES Modules (`import` / `export`) en todo el proyecto; nunca `require()`.
- **Asincronía**: `async/await` con `try / catch` en **todos** los endpoints, sin mezclar con `.then()`.
- **Variables de entorno**: cargar con `dotenv` (`import 'dotenv/config'` o `dotenv.config()`); nunca escribir la URL de conexión ni el puerto en el código.
- **Lógica**: cada enrutador contiene directamente la lógica de acceso a BD y la construcción de la respuesta (no separar en controladores).
- **Formato de respuesta**: todas las respuestas son JSON con un booleano `ok`:
  - Éxito: `{ ok: true, resultado: ... }`
  - Error (400/500/404): `{ ok: false, error: "mensaje" }`
  - Usar exactamente los códigos de estado y los textos de error indicados en la sección 5 (X = id recibido en la URL). Cualquier cambio de código o nombre de campo invalida el endpoint.

## 5. Endpoints requeridos

### 5.1. Recintos (`routes/recintos.js`, montado en `/recintos`)

| Método y ruta | Éxito | Error |
|---|---|---|
| `GET /recintos` | 200, `resultado`: lista de recintos (si hay al menos uno) | 500, `error`: "No se han encontrado recintos" (lista vacía o fallo) |
| `GET /recintos/:id` | 200, `resultado`: recinto | 404, `error`: "Recinto X no encontrado" (nulo o fallo) |
| `GET /recintos/localidad/:nombre` | 200, `resultado`: recintos de esa localidad (si hay al menos uno) | 404, `error`: "No se han encontrado recintos de la localidad indicada" |
| `POST /recintos` | 201, `resultado`: recinto creado (datos del body JSON) | 500, `error`: "Error añadiendo recinto" |
| `DELETE /recintos/:id` | 200, `resultado`: recinto eliminado | 404, `error`: "Error eliminando recinto X" (nulo o fallo) |

### 5.2. Eventos (`routes/eventos.js`, montado en `/eventos`)

| Método y ruta | Éxito | Error |
|---|---|---|
| `GET /eventos` | 200, `resultado`: lista de eventos con recinto y entradas (`populate('recinto')`) | 500, `error`: "No se han encontrado eventos" (lista vacía o fallo) |
| `GET /eventos/:id` | 200, `resultado`: evento (con `populate('recinto')`) | 404, `error`: "Evento X no encontrado" (nulo o fallo) |
| `GET /eventos/localidad/:nombre` | 200, `resultado`: eventos cuyo recinto está en esa localidad y cuya `fecha` aún no ha pasado (`>= new Date()`) | 404, `error`: "No se han encontrado eventos" (vacío o fallo) |
| `POST /eventos` | 201, `resultado`: evento creado | 500, `error`: "Error añadiendo evento" |
| `PUT /eventos/:id` | 200, `resultado`: evento actualizado (`{ new: true, runValidators: true }`) | 404, `error`: "Error actualizando evento X" (nulo o fallo) |
| `DELETE /eventos/:id` | 200, `resultado`: evento eliminado | 404, `error`: "Error eliminando evento X" (nulo o fallo) |

Para `GET /eventos/localidad/:nombre`: buscar primero los recintos con esa `localidad` y después los eventos con `recinto` en esos IDs (`$in`) y `fecha >= new Date()`.

### 5.3. Entradas (en `routes/eventos.js`)

| Método y ruta | Éxito | Error |
|---|---|---|
| `GET /eventos/entradas/:idEvento/:tipoEntrada` | 200, `resultado`: `{ precio, disponibles }` de la entrada de ese tipo | 404, `error`: "Error obteniendo datos de entrada para evento X" (evento o tipo no encontrado, o fallo) |
| `PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad` | 200, `resultado`: evento con sus entradas actualizadas (se restan `cantidad` a `disponibles`) | 404, `error`: "Error actualizando entradas del evento X" (evento/tipo no encontrado, `disponibles < cantidad`, cantidad no válida o fallo) |

Definir las rutas específicas (`/localidad/...`, `/entradas/...`) antes que las genéricas `/:id` dentro de cada enrutador.

## 6. Servidor principal (`index.js`)

En este orden:
1. Importar librerías (`express`, `mongoose`, `dotenv`) y los enrutadores.
2. Conectar con MongoDB usando `process.env.MONGODB_URI`.
3. Crear la app Express y habilitar `express.json()`.
4. Montar enrutadores: `app.use('/recintos', recintos)` y `app.use('/eventos', eventos)`.
5. Arrancar el servidor en `process.env.PORT`.

## 7. Despliegue

- Desplegar en Render conectando a MongoDB Atlas; en Render, definir `PORT` y `MONGODB_URI` como variables de entorno.
- Los endpoints en producción deben ser idénticos a los locales (ej. `xxxxx.onrender.com/recintos`).
- No subir `node_modules/` ni `.env` al repositorio.