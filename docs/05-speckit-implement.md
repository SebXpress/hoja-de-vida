# Speckit-implement

# Implementación de la Iteración 1: Gestor de Hoja de Vida

**Código fuente:** carpeta `hoja-de-vida/` (API NestJS + Prisma + PostgreSQL)
**Tareas implementadas:** T001–T003, T005–T035 y T038 (ver `04-speckit-tasks.md`)
**Tareas pendientes de ejecución local:** T004 (migración), T036 (`npm test`), T037 (prueba manual en Swagger)

## 1. Qué se implementó

| Módulo | Contenido | Archivos clave |
|---|---|---|
| `prisma` | Cliente de base de datos global | `prisma.service.ts`, `prisma.module.ts` |
| `common` | Guards JWT y de roles, decoradores, `RevisionDto`, utilidades de fechas y roles | `common/**` |
| `auth` | Registro, login, estrategia JWT | `auth.service.ts`, `jwt.strategy.ts` |
| `funcionarios` | Consulta y edición del perfil propio | `funcionarios.service.ts` |
| `capacitaciones` | CRUD con propiedad, bloqueo de validados, revisión y bandeja de pendientes | `capacitaciones.service.ts` |
| `formacion-academica` | CRUD con las mismas reglas, origen `MANUAL` | `formacion-academica.service.ts` |
| `hoja-de-vida` | Consolidado con resumen y filtro `soloValidados` | `hoja-de-vida.service.ts` |

**Pruebas escritas (29 casos, Jest):** `auth` 6 · `capacitaciones` 13 · `formacion-academica` 4 · `hoja-de-vida` 3 · `roles.guard` 3.

## 2. Cómo ejecutarlo

Requisitos: Node.js 20+, PostgreSQL 14+.

```bash
cd hoja-de-vida
npm install
cp .env.example .env            # editar DATABASE_URL y JWT_SECRET
npx prisma migrate dev --name init
npx prisma generate
npm test                        # ejecuta las 29 pruebas
npm run start:dev               # API en http://localhost:3000/api/v1
```

Documentación interactiva: `http://localhost:3000/api/docs`

### Crear un usuario revisor

El autorregistro solo crea funcionarios (RF-03). Para probar el flujo de validación, registrar un usuario normal y elevar su rol en la base de datos:

```sql
UPDATE "Usuario" SET rol = 'TALENTO_HUMANO' WHERE email = 'talento@institucion.edu.ec';
```

Volver a iniciar sesión para obtener un token con el nuevo rol.

## 3. Recorrido de prueba (Swagger o cliente HTTP)

1. `POST /api/v1/auth/register` — crear un funcionario:
   ```json
   {
     "email": "ana@institucion.edu.ec",
     "password": "Clave1234",
     "nombres": "Ana",
     "apellidos": "Pérez",
     "cedula": "1712345678",
     "tipoFuncionario": "DOCENTE"
   }
   ```
2. `POST /api/v1/auth/login` → copiar `accessToken` y autorizar en Swagger.
3. `POST /api/v1/capacitaciones`:
   ```json
   {
     "nombre": "Docencia universitaria",
     "institucion": "ESPE",
     "fechaInicio": "2025-01-10",
     "fechaFin": "2025-02-10",
     "horas": 40,
     "evidenciaUrl": "https://ejemplo.com/diploma.pdf"
   }
   ```
   Resultado esperado: estado `PENDIENTE`.
4. `POST /api/v1/formacion-academica` con un título de maestría.
5. Con el usuario revisor: `GET /capacitaciones/pendientes` y `PATCH /capacitaciones/{id}/revision` con `{"decision": "VALIDADO"}`.
6. Con el funcionario: intentar `PATCH /capacitaciones/{id}` → **403** (registro validado).
7. `GET /hoja-de-vida/mi-hoja?soloValidados=true` → consolidado con resumen.

Casos de error para verificar: fecha fin anterior al inicio (400), rechazo sin observación (400), acceso a `/pendientes` como funcionario (403), solicitud sin token (401), registro con campo `rol` (400 por propiedad no permitida).

## 4. Decisiones de implementación

- **Rol inmutable en el registro:** el servicio fija `FUNCIONARIO` y el `ValidationPipe` rechaza cualquier propiedad `rol` enviada.
- **Reinicio del ciclo de validación:** `actualizar` siempre devuelve el registro a `PENDIENTE` y limpia los datos de revisión.
- **Mensajes de login genéricos:** se evita la enumeración de correos.
- **Reglas compartidas:** `validarRangoFechas`, `validarNoFutura`, `esRevisor` y `RevisionDto` se reutilizan entre capacitaciones y formación.
- **Cédula como cadena de 10 dígitos:** se valida el formato; la verificación del dígito verificador queda como mejora.

## 5. Limitaciones conocidas

- La evidencia es un enlace (la carga de archivos es de la iteración 2).
- No existe endpoint para crear revisores (T041).
- No hay límite de solicitudes en autenticación (T040).
- No hay pruebas e2e; las unitarias simulan Prisma (T039).
- Un registro validado solo podría revertirse manualmente; el procedimiento depende de la respuesta del usuario funcional (especificación §11, punto 2).


## 6. Resultado de la ejecución local

> Completar tras ejecutar `npm test`.

| Fecha | Comando | Resultado | Observaciones |
|---|---|---|---|
|21-10-2026 | `npm test` |APROBADO |5 suites aprobadas, 29 pruebas aprobadas, 0 fallidas. Tiempo: 6,384 s. |
|21-10-2026 | `npm run build` |APROBADO |0 errores de TypeScript. NestJS arrancó correctamente y registró las rutas de la API. |
