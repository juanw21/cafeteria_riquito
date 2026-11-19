# Sistema web de cafetería

Aplicación independiente con Angular, Express/CommonJS y MySQL. Los registros comerciales se administran en la base de datos; el esquema no incluye productos ni datos ficticios.

La interfaz usa una estructura editorial de cafetería reconocida como referencia visual (navegación por secciones, fotografía/video protagonista, tarjetas de menú y paleta verde cálida), sin usar logos ni textos de otra marca. El video ambiental de Pexels se registra en MySQL y se obtiene por la API.

## Requisitos

- Node.js 24.15 o posterior y npm (requerido por la versión actual de Angular).
- MySQL 8.0 o posterior.

## Base de datos y backend

### Crear la base desde MySQL Workbench

1. Abre Workbench y conéctate a tu servidor MySQL local.
2. Abre `backend/database/schema.sql` con **File → Open SQL Script**.
3. Ejecuta todo el script con el botón del rayo (Execute). El script crea `cafeteria_app_db`, sus tablas y un registro de video Pexels; se puede volver a ejecutar sin duplicar tablas ni el video. No borra tablas ni inserta productos comerciales.
4. En el panel **SCHEMAS**, pulsa **Refresh**. Debe aparecer `cafeteria_app_db`; expándela para ver las tablas.
5. Confirma la conexión del backend en `backend/.env`: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME=cafeteria_app_db` deben corresponder a la misma conexión de Workbench.
6. Desde la terminal, entra en `backend/`, instala dependencias con `npm install` y ejecuta `npm start`. La API queda disponible en `http://127.0.0.1:3000`; `GET /api/health` comprueba que Node puede conectar a MySQL.
7. Crea el primer administrador con `npm run admin:create`. El comando solicita nombre, correo y contraseña y guarda la contraseña con hash bcrypt.

El comando alternativo `npm run db:init` ejecuta ese mismo `schema.sql` usando la conexión de `.env`.

### Chatbot local

El backend consulta primero MySQL y entrega al modelo solo los registros recuperados. Si Ollama no responde, utiliza una respuesta de respaldo basada en esos registros. Para habilitar Gemma 3 localmente, instala Ollama y ejecuta `ollama pull gemma3:4b`; configura `OLLAMA_ENABLED=true`, `OLLAMA_URL` y `OLLAMA_MODEL` en `.env`. Smoke check opcional: `npm run test:ollama`.

## Frontend

En otra consola: `cd frontend`, `npm install`, `npm start`. Angular queda disponible en `http://localhost:4200`. La URL REST está centralizada en `frontend/src/environments/environment.ts`.

Desde `/admin` inicia sesión y crea categorías, productos, servicios, especialidades, textos, imágenes (por ruta), preguntas frecuentes y demás contenido. La portada consulta la API y muestra estados vacíos cuando no hay registros activos.

## Datos de cada apartado en MySQL

- Video de portada y fotos: `galeria` (`tipo='video'` o `tipo='imagen'`, con `ruta_archivo`).
- Servicios: `servicios`.
- Especialidades: `especialidades`, opcionalmente relacionadas con `productos`.
- Menú, categorías y precios: `categorias` y `productos.precio` (DECIMAL).
- Portada e información “Nosotros”: `contenido_sitio` (`seccion='inicio'` o `seccion='nosotros'`).
- Contacto y datos generales: `configuracion_cafeteria`; los mensajes se guardan en `mensajes_contacto`.

Angular obtiene estos registros mediante la API. El esquema registra el video ambiental de Pexels, pero no inventa servicios, productos, precios, historia ni datos de contacto. Completa la información real desde `/admin`.

## Endpoints

La API está bajo `/api`. Ejemplos completos y formato de respuestas en [API.md](API.md). `GET /api/health` comprueba el proceso y el acceso a MySQL. `POST /api/chatbot` recupera contexto de la base de datos y usa Gemma 3 por Ollama cuando está disponible; también tiene respaldo local sin Ollama.

## Pruebas y verificación

Con un esquema ya creado en una base **desechable de pruebas**, configura `backend/.env` para apuntar a esa base. Entra a `backend/` y ejecuta `npm test`. La suite crea un usuario y registros temporales con identificadores únicos y los elimina al finalizar. No la ejecutes apuntando a una base con datos reales.

## Estado de esta entrega

Incluye esquema relacional, API con login JWT, CRUD para recursos de contenido, configuración, recepción y consulta administrativa de mensajes, limitación del chatbot y una interfaz pública/admin. El chatbot recupera productos, categorías, servicios, especialidades, configuración, contenido y preguntas frecuentes desde MySQL antes de generar una respuesta con Gemma 3.

Las imágenes se administran como rutas/URL; la carga real de archivos desde el navegador y la paginación/filtros siguen pendientes. Las pruebas de integración requieren una base desechable con el esquema instalado. No se han cargado datos comerciales de ejemplo.
