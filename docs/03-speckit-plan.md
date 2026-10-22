# Speckit-plan

# Plan Técnico: Gestor de Hoja de Vida — Iteración 1

**Versión:** 1.0 · **Entradas:** `01-speckit-constitution.md`, `02-speckit-specify.md`

## 1. Resumen

La iteración 1 entrega una API REST en NestJS que cubre el ciclo completo de autoservicio y validación para tres componentes de la hoja de vida (datos personales, formación académica y capacitaciones) más su consolidación en JSON. Establece la base (autenticación, roles, estructura modular, convenciones) sobre la que se agregarán las integraciones y reportes.

## 2. Verificación contra la constitución

| Principio / norma | Cómo se cumple en el plan |
|---|---|
| Modularidad | Un módulo NestJS por componente de la hoja de vida |
| Separación de responsabilidades | Controlador (HTTP) → Servicio (reglas) → Prisma (datos) |
| Tipado estático | TypeScript con `strict: true` (excepción: `strictPropertyInitialization` desactivado por los DTO) |
| Validación de entrada | DTO + `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted` |
| Seguridad | JWT + `RolesGuard`, bcrypt, CORS por variable de entorno, rol fijo en autorregistro |
| Reutilización | `common/` con guards, decoradores, `RevisionDto`, utilidades de fechas y roles |
| Documentación | Plugin de Swagger de Nest: DTO documentados automáticamente |
| Calidad | Pruebas unitarias de servicios con Prisma simulado |

## 3. Arquitectura

```
Cliente (futuro frontend / Swagger)
        │  HTTP + JWT
        ▼
┌───────────────────────────── NestJS ──────────────────────────────┐
│ Controladores ─► Guards (JwtAuthGuard, RolesGuard) ─► Servicios   │
│                                                         │         │
│  auth · funcionarios · capacitaciones ·                 ▼         │
│  formacion-academica · hoja-de-vida              PrismaService    │
└─────────────────────────────────────────────────────────┬─────────┘
                                                          ▼
                                                    PostgreSQL
```

Extensión futura (iteraciones 3 y 4): una carpeta `integraciones/` con **puertos** (interfaces) y **adaptadores** para investigación, vinculación y el bus de datos de formación; los servicios dependen del puerto, no del sistema concreto.

## 4. Modelo de datos

```
Usuario 1──1 Funcionario 1──* Capacitacion
                         1──* FormacionAcademica
```

- **Usuario:** `id`, `email` (único), `passwordHash`, `rol`, `activo`.
- **Funcionario:** `usuarioId` (único), `nombres`, `apellidos`, `cedula` (única), `telefono?`, `direccion?`, `tipoFuncionario`, `cargo?`, `departamento?`.
- **Capacitacion:** `funcionarioId`, `nombre`, `institucion`, `fechaInicio`, `fechaFin`, `horas`, `evidenciaUrl`, `estado`, `observacionRevision?`, `revisadoPorId?`, `revisadoEn?`.
- **FormacionAcademica:** `funcionarioId`, `nivel`, `titulo`, `institucion`, `pais`, `fechaObtencion`, `numeroRegistroSenescyt?`, `origen`, `evidenciaUrl?`, `estado`, campos de revisión.
- **Enumeraciones:** `Rol`, `TipoFuncionario`, `EstadoValidacion`, `NivelFormacion`, `OrigenRegistro`.
- **Índices:** por `funcionarioId` y `estado` en las tablas de registros (consultas de listado y bandeja de pendientes).
- **Integridad:** borrado en cascada de registros al eliminar el funcionario.

## 5. Contrato de la API (prefijo `/api/v1`)

| Método | Ruta | Acceso | Requisitos |
|---|---|---|---|
| POST | `/auth/register` | Público | RF-01–03 |
| POST | `/auth/login` | Público | RF-04–05 |
| GET | `/funcionarios/mi-perfil` | Autenticado | RF-07 |
| PATCH | `/funcionarios/mi-perfil` | Autenticado | RF-07–08 |
| POST | `/capacitaciones` | Autenticado | RF-09–12 |
| GET | `/capacitaciones/mias` | Autenticado | RF-13 |
| GET | `/capacitaciones/pendientes` | Revisor | RF-24 |
| GET | `/capacitaciones/:id` | Propietario o revisor | RF-14 |
| PATCH | `/capacitaciones/:id` | Propietario | RF-14–16 |
| DELETE | `/capacitaciones/:id` | Propietario | RF-14–15 |
| PATCH | `/capacitaciones/:id/revision` | Revisor | RF-21–23 |
| POST | `/formacion-academica` | Autenticado | RF-17–19 |
| GET | `/formacion-academica/mias` | Autenticado | RF-20 |
| GET | `/formacion-academica/:id` | Propietario o revisor | RF-20 |
| PATCH | `/formacion-academica/:id` | Propietario | RF-20 |
| DELETE | `/formacion-academica/:id` | Propietario | RF-20 |
| PATCH | `/formacion-academica/:id/revision` | Revisor | RF-21–23 |
| GET | `/hoja-de-vida/mi-hoja?soloValidados=` | Autenticado | RF-25, RF-27 |
| GET | `/hoja-de-vida/:funcionarioId?soloValidados=` | Revisor | RF-26–27 |

Las rutas fijas (`mias`, `pendientes`) se declaran antes que `:id` para evitar colisiones.

## 6. Decisiones técnicas

| # | Decisión | Motivo | Alternativa descartada |
|---|---|---|---|
| D1 | Autenticación propia con JWT | Permite avanzar sin depender del ERP; reemplazable cuando se defina el SSO | Esperar la integración con el ERP |
| D2 | `funcionarioId` dentro del token | Evita una consulta por solicitud para saber el dueño de los registros | Consultar `Funcionario` en cada request |
| D3 | Evidencia como URL | Entrega valor sin resolver el almacenamiento de archivos | Subida de archivos (iteración 2) |
| D4 | Flujo de estados con modificación → `PENDIENTE` | Impide que un dato validado cambie sin revisión | Edición libre posterior a la validación |
| D5 | Reglas compartidas en `common/utils` | Evita duplicar validaciones de fechas y roles entre módulos | Copiar la lógica en cada servicio |
| D6 | `RevisionDto` compartido | Mismo contrato para validar capacitaciones y formación | DTO por módulo |
| D7 | Datos de revisores creados en base de datos | Evita exponer un endpoint de creación de roles privilegiados | Endpoint de administración (iteración 2) |
| D8 | Pruebas unitarias con Prisma simulado | Rápidas y sin base de datos | Pruebas e2e con BD (se recomienda añadir luego) |
| D9 | Campo `origen` y puertos futuros | Prepara la trazabilidad de datos externos | Añadirlo cuando llegue la integración |

## 7. Estructura de archivos

```
hoja-de-vida/
├── prisma/schema.prisma
├── docs/                                 # documentos Speckit
├── src/
│   ├── main.ts · app.module.ts
│   ├── prisma/{prisma.module,prisma.service}.ts
│   ├── common/
│   │   ├── decorators/{roles,current-user}.decorator.ts
│   │   ├── guards/{jwt-auth,roles}.guard.ts
│   │   ├── dto/revision.dto.ts
│   │   ├── interfaces/usuario-autenticado.interface.ts
│   │   └── utils/{fechas,roles}.ts
│   ├── auth/ · funcionarios/ · capacitaciones/ · formacion-academica/ · hoja-de-vida/
│   └── (cada módulo: module, controller, service, dto/, *.spec.ts)
├── package.json · tsconfig.json · nest-cli.json · .env.example
```

## 8. Estrategia de pruebas

- **Unitarias (Jest):** cada servicio con `PrismaService` simulado; se cubren reglas de negocio, errores y permisos de propiedad. `RolesGuard` se prueba de forma aislada.
- **Pendiente (iteración 2):** pruebas e2e con base de datos de pruebas y `supertest` para verificar la cadena DTO → guard → servicio → BD.
- **Criterio de salida:** todas las pruebas pasan y cada criterio de aceptación tiene al menos una prueba o verificación manual documentada.

## 9. Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Requisitos funcionales aún sin definir | Alta | Alto | Iteración 1 acotada a lo explícito en la reunión; puntos por aclarar listados en la especificación |
| Disponibilidad de usuario funcional y contraparte UTIC | Media | Alto | Talleres presenciales los viernes; avanzar con supuestos documentados |
| Cambio del esquema de autenticación (SSO) | Media | Medio | Autenticación aislada en `auth/`; resto de módulos usa solo `UsuarioAutenticado` |
| Detalles de APIs externas desconocidos | Alta | Medio | Puertos e interfaces; datos simulados hasta tener acceso |
| Disponibilidad del equipo (actividades académicas) | Alta | Medio | Iteraciones pequeñas y tareas independientes |
| Datos personales sensibles | Media | Alto | Acceso por propiedad, HTTPS, secretos fuera del repositorio |

## 10. Hoja de ruta

| Iteración | Entregables clave |
|---|---|
| 1 | Base + autenticación + datos personales + formación + capacitaciones + validación + consolidado |
| 2 | Experiencia docente, carga de archivos, PDF, parametrización por tipo, límite de solicitudes, pruebas e2e |
| 3 | Puertos y adaptadores hacia investigación y vinculación (publicaciones y proyectos) |
| 4 | Integración con el bus de datos de formación, dashboard y reportes de acreditación |

## 11. Despliegue y configuración

Variables de entorno: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`, `PORT`. Migraciones con `prisma migrate`. HTTPS terminado en el proxy inverso del entorno institucional.
