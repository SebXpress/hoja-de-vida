# Speckit-task

# Documento de Tareas: Gestor de Hoja de Vida — Iteración 1

**Convenciones:** `[P]` = puede ejecutarse en paralelo con otras tareas de la misma fase · `[x]` = completada en el repositorio · `[ ]` = pendiente · `→ RF/CA` = trazabilidad hacia la especificación.

## Fase 0: Preparación

- [x] **T001** Crear proyecto NestJS con `package.json`, `tsconfig.json` (modo estricto) y `nest-cli.json` con el plugin de Swagger.
- [x] **T002** [P] Crear `.env.example` y `.gitignore` (excluye `.env`, `node_modules`, `dist`). → Constitución §5
- [x] **T003** Definir `prisma/schema.prisma` con enumeraciones, entidades, relaciones e índices. → Plan §4
- [ ] **T004** Generar la migración inicial (`prisma migrate dev`) contra PostgreSQL local.
- [x] **T005** Crear `PrismaService` y `PrismaModule` global.
- [x] **T006** Configurar `main.ts`: prefijo `/api/v1`, `ValidationPipe`, CORS por entorno y Swagger en `/api/docs`. → RNF-02, RNF-03

## Fase 1: Base compartida (bloquea las fases siguientes)

- [x] **T007** [P] Interfaz `UsuarioAutenticado`.
- [x] **T008** [P] Decorador `@Roles` y `@CurrentUser`.
- [x] **T009** [P] `JwtAuthGuard` y `RolesGuard`. → RF-06, RF-21
- [x] **T010** [P] Utilidades `validarRangoFechas`, `validarNoFutura` y `esRevisor`. → RF-10, RF-18
- [x] **T011** [P] `RevisionDto` compartido. → RF-22
- [x] **T012** Prueba unitaria de `RolesGuard`.

## Fase 2: HU-01 Autenticación

- [x] **T013** DTO `RegisterDto` y `LoginDto` con validaciones (contraseña ≥ 8 con letras y números, cédula de 10 dígitos). → RF-01
- [x] **T014** `AuthService.register`: unicidad de correo y cédula, hash bcrypt, rol fijo `FUNCIONARIO`, creación anidada de `Funcionario`. → RF-02, RF-03 · CA-01, CA-02
- [x] **T015** `AuthService.login`: verificación con mensaje genérico y emisión de JWT con `funcionarioId`. → RF-04, RF-05 · CA-03
- [x] **T016** `JwtStrategy`, `AuthModule` y `AuthController`. → RF-06 · CA-14
- [x] **T017** Pruebas unitarias de `AuthService` (6 casos).

## Fase 3: HU-02 Datos personales

- [x] **T018** [P] `UpdateFuncionarioDto` (excluye cédula y tipo). → RF-08
- [x] **T019** `FuncionariosService` y controlador `GET/PATCH /funcionarios/mi-perfil`. → RF-07

## Fase 4: HU-03, HU-05, HU-06, HU-07 Capacitaciones

- [x] **T020** DTO de creación y actualización de capacitaciones. → RF-09, RF-11
- [x] **T021** `crear` con validación de fechas y propiedad. → RF-10, RF-12 · CA-04, CA-05
- [x] **T022** `listarMias` y `listarPendientes`. → RF-13, RF-24
- [x] **T023** `obtener` con control de propiedad/rol. → RF-14 · CA-06
- [x] **T024** `actualizar` y `eliminar` con bloqueo de registros validados y reinicio a `PENDIENTE`. → RF-15, RF-16 · CA-07, CA-08
- [x] **T025** `revisar` con observación obligatoria al rechazar y registro del revisor. → RF-22, RF-23 · CA-10, CA-11
- [x] **T026** Controlador con rutas fijas antes de `:id` y roles en `pendientes` y `revision`. → RF-21 · CA-09
- [x] **T027** Pruebas unitarias de `CapacitacionesService` (13 casos).

## Fase 5: HU-04 Formación académica *(en paralelo con la Fase 4 tras la Fase 1)*

- [x] **T028** [P] DTO de creación y actualización de formación. → RF-17
- [x] **T029** [P] Servicio con `crear` (origen `MANUAL`, fecha no futura), `listarMias`, `obtener`, `actualizar`, `eliminar`, `revisar`. → RF-17–20 · CA-12
- [x] **T030** [P] Controlador y módulo con roles en `revision`. → RF-21
- [x] **T031** Pruebas unitarias de `FormacionAcademicaService` (4 casos).

## Fase 6: HU-08 Hoja de vida consolidada

- [x] **T032** `HojaDeVidaService.consolidar` con filtro `soloValidados` y resumen de horas. → RF-25, RF-27 · CA-13
- [x] **T033** Controlador `GET /hoja-de-vida/mi-hoja` y `GET /hoja-de-vida/:funcionarioId` (revisor). → RF-26
- [x] **T034** Pruebas unitarias de `HojaDeVidaService` (3 casos).

## Fase 7: Cierre de la iteración

- [x] **T035** Ensamblar `AppModule` con todos los módulos.
- [ ] **T036** Instalar dependencias, generar el cliente de Prisma y ejecutar `npm test`; registrar el resultado. *(pendiente de ejecutar en el equipo del estudiante)*
- [ ] **T037** Probar manualmente el flujo completo en Swagger: registro → login → crear capacitación → revisar con un usuario revisor → consolidar.
- [x] **T038** Redactar los documentos Speckit y el documento de auditoría de cobertura.

## Backlog (iteraciones siguientes)

- [ ] **T039** Pruebas e2e con `supertest` y base de datos de pruebas. → CA-02, CA-14
- [ ] **T040** Límite de solicitudes (`@nestjs/throttler`) en `/auth/*`. → Constitución §5
- [ ] **T041** Endpoint o script de creación de usuarios revisores. → Plan D7
- [ ] **T042** Módulo `experiencia-docente`. → Iteración 2
- [ ] **T043** Carga de archivos de evidencia. → Iteración 2
- [ ] **T044** Generación de PDF de la hoja de vida. → Iteración 2
- [ ] **T045** Parametrización de componentes por tipo de funcionario. → Iteración 2
- [ ] **T046** Puerto y adaptador de investigación (publicaciones y proyectos). → Iteración 3
- [ ] **T047** Puerto y adaptador de vinculación. → Iteración 3
- [ ] **T048** Adaptador del bus de datos de formación académica (`origen = BUS_DATOS`). → Iteración 4
- [ ] **T049** Dashboard y reportería de acreditación. → Iteración 4
- [ ] **T050** Talleres de requisitos con el usuario funcional para resolver los puntos [CLARIFICAR] de la especificación.
- [ ] **T051** Pruebas unitarias de `FuncionariosService` (hallazgo H2 de la auditoría). → RF-07, RF-08
- [ ] **T052** Ampliar pruebas: `listarMias`, `listarPendientes` y `obtener` de formación (hallazgo H6). → RF-13, RF-20, RF-24
- [ ] **T053** Añadir clave foránea de `revisadoPorId` hacia `Usuario` en una nueva migración (hallazgo H7).

## Dependencias entre fases

```
Fase 0 → Fase 1 → ┬─ Fase 2 (auth) ─────────┐
                  ├─ Fase 3 (perfil) ───────┤
                  ├─ Fase 4 (capacitaciones)├─► Fase 6 (consolidado) → Fase 7 (cierre)
                  └─ Fase 5 (formación) ────┘
```
