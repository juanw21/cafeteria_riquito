# Riquito Riquito

Aplicación web para una cafetería, construida con Angular, Node.js/Express y MySQL. El frontend consume el backend mediante la API REST.

## Requisitos

- Node.js 24.15 o posterior y npm.
- MySQL 8.0 o posterior.
- Ollama con `gemma3:4b` para habilitar respuestas del chatbot con Gemma 3 (opcional; hay respuestas de respaldo si Ollama no está disponible).

## Preparar MySQL y backend

1. Clona este repositorio y abre una terminal en la carpeta `backend`.
2. Instala dependencias con `npm install`.
3. Copia `.env.example` como `.env` y configura la conexión de MySQL y un `JWT_SECRET` propio. El `.env` real no forma parte del repositorio.
4. Crea el esquema desde MySQL Workbench abriendo `database/schema.sql`, o ejecuta `npm run db:init` después de configurar `.env`.
5. Carga la información inicial de demostración con `npm run db:seed`. El comando es idempotente: agrega los datos que falten sin reemplazar cambios existentes. Los precios están en BOB y son demostrativos; los datos de contacto no confirmados quedan vacíos.
6. En la primera instalación, ejecuta `npm run db:product-images`. Descarga fotos de producto a `frontend/public/uploads/productos` y guarda sus rutas en MySQL. Requiere conexión a Internet.
7. Inicia la API con `npm start`. La API usa `http://127.0.0.1:3000`; `GET /api/health` comprueba el acceso a MySQL.
8. Crea el usuario administrador con `npm run admin:create`.

Para usar el chatbot con Gemma 3, instala Ollama, ejecuta `ollama pull gemma3:4b` y configura `OLLAMA_ENABLED`, `OLLAMA_URL` y `OLLAMA_MODEL` en `.env`.

## Preparar frontend

En otra terminal, entra en `frontend`, instala dependencias con `npm install` y ejecuta `npm start`. Angular queda disponible en `http://localhost:4200`.

La URL del backend se configura en `frontend/src/environments/environment.ts`. Las imágenes locales se sirven desde `frontend/public`.

## Datos almacenados en MySQL

- `galeria`: video de portada e imágenes de la cafetería.
- `categorias` y `productos`: menú, descripciones, disponibilidad y precios.
- `servicios` y `especialidades`: servicios ofrecidos y productos destacados.
- `contenido_sitio`: textos de inicio, nosotros y las demás secciones.
- `configuracion_cafeteria`: nombre, contacto, horario, moneda y redes sociales.
- `preguntas_frecuentes`: respuestas de referencia para el chatbot.
- `mensajes_contacto`: mensajes enviados desde el formulario.

El contenido inicial se carga desde `backend/database/seed.js`; el video de portada se agrega desde `backend/database/schema.sql`. La base de datos local y el archivo `.env` no se suben a GitHub.

## Administración

Abre `http://localhost:4200/admin` e inicia sesión para administrar productos, precios, servicios, especialidades, galería, textos, preguntas frecuentes y datos del negocio.

## API

Los endpoints están bajo `/api`. Consulta [API.md](API.md) para ver rutas, autenticación y formatos de respuesta.

## Pruebas

Con una base de pruebas desechable que tenga el esquema instalado, ejecuta `npm test` desde `backend`. No uses una base que contenga datos importantes.
