# Backend ToolsPrint

API en Node.js/Express para gestionar empresas, usuarios y generar PDFs tipo
Polaroid listos para imprimir.

## Ejecutar

```bash
npm install
npm run dev
```

La API queda disponible en:

```text
http://localhost:4000
```

## Base de datos

El script de tablas esta en:

```text
src/db/schema.sql
```

La conexion usa las variables definidas en `src/.env`.

Si ya creaste la tabla `usuarios` con `contraseña VARCHAR(50)`, ejecuta esta
migracion para que quepan los hashes:

```sql
ALTER TABLE usuarios MODIFY `contraseña` VARCHAR(255) NOT NULL;
```

## Empresas

- `GET /api/empresas`
- `GET /api/empresas/:id`
- `POST /api/empresas`
- `PUT /api/empresas/:id`
- `PATCH /api/empresas/:id/estado`
- `DELETE /api/empresas/:id`

Ejemplo para crear:

```json
{
  "nombre": "Papeleria Central",
  "telefono": "+503 7000-0000",
  "direccion": "San Salvador",
  "correo": "contacto@papeleria.com"
}
```

## Usuarios

- `GET /api/usuarios`
- `GET /api/usuarios/:id`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`

Ejemplo para crear:

```json
{
  "nombre": "Ana",
  "apellido": "Lopez",
  "usuario": "alopez",
  "contrasena": "12345",
  "id_empresa": 1
}
```

Las contrasenas nuevas se guardan como hash `scrypt`. Si un usuario viejo tiene
contrasena en texto plano, el login la acepta una vez y luego intenta migrarla a
hash automaticamente.

## Login

- `POST /api/auth/login`

```json
{
  "usuario": "alopez",
  "contrasena": "12345"
}
```

## Herramientas de impresion

- `GET /api/herramientas/papeles`
- `GET /api/herramientas/papeles/:paperSize/layout`
- `POST /api/herramientas/layout`
- `POST /api/herramientas/preview`
- `POST /api/herramientas/pdf`

Tamanos disponibles:

- `carta`
- `legal`
- `a4`
- `4x6`
- `4x5`

Para `preview` y `pdf`, enviar `multipart/form-data`:

```text
paperSize = 4x6
imagenes = archivo1.jpg
imagenes = archivo2.png
```

`preview` responde un PDF inline para mostrarlo en un visor. `pdf` responde el
archivo como descarga.
