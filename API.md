# API REST

Base local: `http://127.0.0.1:3000/api`. JSON usa UTF-8. Las operaciones de escritura requieren `Authorization: Bearer <token>`.

## Salud y autenticación

- `GET /health` → `{ "success": true, "status": "ok" }`
- `POST /auth/login` con `{ "email": "...", "password": "..." }` → devuelve `token` y un perfil sin hash.
- `GET /auth/me` → perfil autenticado.

## Contenido administrable

Para `categorias`, `productos`, `servicios`, `especialidades`, `contenido`, `galeria` y `preguntas`:

- `GET /{recurso}` devuelve únicamente registros activos/disponibles; admite `q`, `page` y `limit` (máximo 100). Con un token válido permite al administrador consultar también los inactivos.
- `GET /{recurso}/{id}` consulta un registro.
- `POST /{recurso}`, `PUT /{recurso}/{id}` y `DELETE /{recurso}/{id}` requieren token.

Ejemplo, crear producto:

```http
POST /api/productos
Authorization: Bearer <token>
Content-Type: application/json

{"nombre":"Nombre registrado por el administrador","descripcion":"Descripción","precio":12.50,"disponible":true}
```

El producto creado se devuelve como `{ "success": true, "data": { ... } }`. Los precios negativos y los campos principales requeridos se rechazan.

## Otros recursos

- `GET /configuracion`; `PUT /configuracion` (autenticado) para datos generales, incluida `moneda` como código ISO de tres letras. Sin moneda configurada, el sitio muestra el importe sin asumir una divisa.
- `POST /contacto` con `nombre`, `email` y `mensaje`; almacena una consulta.
- `POST /chatbot` con `{ "message": "..." }`; responde `{ "success": true, "response": "...", "source": "database", "items": [], "hasInformation": false }`.

El chatbot reconoce consultas sobre menú/precios, categorías, servicios, especialidades, ubicación/contacto/horario, contenido institucional y coincidencias de preguntas frecuentes. Cuando no obtiene filas responde que no encontró información registrada. No usa un modelo externo.
