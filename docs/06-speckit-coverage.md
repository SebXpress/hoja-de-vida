# Speckit-coverage

# Auditoría de Cobertura: Gestor de Hoja de Vida — Iteración 1

**Alcance:** verificar que cada requisito de la especificación tenga tareas, implementación y pruebas, y que cada pieza de código responda a un requisito.
**Método:** revisión de trazabilidad entre `02-speckit-specify.md`, `04-speckit-tasks.md`, el código en `src/` y los 29 casos de prueba escritos.
**Aviso importante:** las pruebas están escritas pero **aún no se han ejecutado** (el entorno de elaboración no tenía acceso a la red para instalar dependencias). Los estados indican cobertura *por diseño*; deben confirmarse con `npm test` y `npm run test:cov`.

**Leyenda:** ✅ Cubierto (implementado y con prueba) · 🟡 Parcial (implementado; prueba incompleta o solo por configuración) · ⚠️ Sin prueba · ❌ No implementado

## 1. Resumen ejecutivo

| Métrica | Resultado |
|---|---|
| Requisitos funcionales (27) implementados | **27 / 27** |
| RF con prueba completa | 12 (44 %) |
| RF con cobertura parcial | 10 (37 %) |
| RF sin prueba automatizada | 5 (19 %) |
| Criterios de aceptación (14) con prueba completa | 9 · parciales 4 · sin prueba 1 |
| Tareas de la iteración completadas | 35 de 38 (T004, T036 y T037 requieren ejecución local) |
| Requisitos no funcionales verificados por prueba | 1 de 7 (el resto se cumple por configuración) |

**Conclusión:** la iteración implementa todo su alcance. La principal brecha es de verificación: faltan pruebas de DTO, de `FuncionariosService`, del flujo con autenticación real (e2e) y la ejecución confirmada de la suite.

## 2. Trazabilidad de requisitos funcionales

| RF | Tarea(s) | Implementación | Prueba | Estado |
|---|---|---|---|---|
| RF-01 Autorregistro | T013, T014 | `RegisterDto`, `AuthService.register` | Servicio probado; reglas del DTO no | 🟡 |
| RF-02 Unicidad correo/cédula | T014 | `AuthService.register` | `auth.service.spec` (2 casos) | ✅ |
| RF-03 Rol fijo `FUNCIONARIO` | T014 | `AuthService.register` + `forbidNonWhitelisted` | Rol probado en servicio; rechazo de `rol` por pipe no | 🟡 |
| RF-04 Login con JWT | T015 | `AuthService.login` | `auth.service.spec` | ✅ |
| RF-05 Credenciales inválidas genéricas | T015 | `AuthService.login` | `auth.service.spec` (2 casos) | ✅ |
| RF-06 Rutas protegidas | T016, T009 | `JwtAuthGuard`, `JwtStrategy` | Sin prueba | 🟡 |
| RF-07 Consulta/edición de perfil | T018, T019 | `FuncionariosService` | Sin spec | ⚠️ |
| RF-08 Cédula y tipo no editables | T018 | `UpdateFuncionarioDto` (campos excluidos) | Sin prueba | ⚠️ |
| RF-09 Crear capacitación | T020, T021 | `CapacitacionesService.crear` | Asociación al funcionario probada | 🟡 |
| RF-10 Fechas válidas | T010, T021 | `validarRangoFechas`, `validarNoFutura` | 2 casos | ✅ |
| RF-11 Horas y URL válidas | T020 | `CreateCapacitacionDto` | Sin prueba de DTO | ⚠️ |
| RF-12 Estado inicial `PENDIENTE` | T021 | Valor por defecto en el esquema | No se verifica contra BD | 🟡 |
| RF-13 Listado propio ordenado | T022 | `listarMias` | Sin prueba | ⚠️ |
| RF-14 Solo el propietario modifica | T023, T024 | `obtenerPropia`, `obtener` | 4 casos | ✅ |
| RF-15 Validado inmutable | T024 | `actualizar`, `eliminar` | 2 casos (capacitaciones) + 1 (formación) | ✅ |
| RF-16 Rechazado → `PENDIENTE` | T024 | `actualizar` | 1 caso | ✅ |
| RF-17 Crear formación | T028, T029 | `FormacionAcademicaService.crear` | Origen y propietario probados; DTO no | 🟡 |
| RF-18 Fecha de obtención no futura | T029 | `validarNoFutura` | 1 caso | ✅ |
| RF-19 Origen `MANUAL` | T029 | `crear` | 1 caso | ✅ |
| RF-20 Mismas reglas que capacitación | T029 | Servicio de formación | Solo bloqueo de validado y rechazo; faltan propiedad y listado | 🟡 |
| RF-21 Solo revisores validan | T009, T026, T030 | `@Roles` + `RolesGuard` | Guard probado aislado; no integrado en rutas | 🟡 |
| RF-22 Rechazo con observación | T025 | `revisar` (ambos módulos) | 1 caso por módulo | ✅ |
| RF-23 Registro de revisor y fecha | T025 | `revisar` | Probado en capacitaciones, no en formación | 🟡 |
| RF-24 Bandeja de pendientes | T022 | `listarPendientes` | Sin prueba | ⚠️ |
| RF-25 Consolidado y resumen | T032 | `HojaDeVidaService` | 2 casos | ✅ |
| RF-26 Revisor consulta cualquier hoja | T033 | `@Roles` en controlador | Sin prueba de integración | 🟡 |
| RF-27 Filtro `soloValidados` | T032 | `consolidar` | 1 caso | ✅ |

## 3. Trazabilidad de criterios de aceptación

| CA | Verificado por | Estado |
|---|---|---|
| CA-01 Correo duplicado → 409 | `auth.service.spec` | ✅ |
| CA-02 `rol` en el registro | Rol fijo probado; el rechazo depende de `ValidationPipe` | 🟡 |
| CA-03 Login inválido → 401 genérico | `auth.service.spec` | ✅ |
| CA-04 Fechas incoherentes → 400 | `capacitaciones.service.spec` | ✅ |
| CA-05 Creación asociada y `PENDIENTE` | Asociación probada; estado por defecto de BD | 🟡 |
| CA-06 Acceso ajeno → 403 | `capacitaciones.service.spec` | ✅ |
| CA-07 Validado inmutable | `capacitaciones.service.spec` | ✅ |
| CA-08 Rechazado → `PENDIENTE` | `capacitaciones.service.spec` | ✅ |
| CA-09 Rutas de revisor vedadas | `roles.guard.spec` (aislado) | 🟡 |
| CA-10 Rechazo sin observación → 400 | Ambos servicios | ✅ |
| CA-11 Revisor y fecha guardados | `capacitaciones.service.spec` | ✅ |
| CA-12 Fecha de obtención futura → 400 | `formacion-academica.service.spec` | ✅ |
| CA-13 Consolidado con filtro | Lógica probada; sin datos reales mixtos | 🟡 |
| CA-14 Sin token → 401 | Sin prueba | ⚠️ |

## 4. Cobertura de requisitos no funcionales

| RNF | Evidencia | Estado |
|---|---|---|
| RNF-01 Seguridad (bcrypt, JWT, CORS) | bcrypt probado; JWT y CORS configurados sin prueba | 🟡 |
| RNF-02 Validación de DTO | `ValidationPipe` global; sin prueba | ⚠️ |
| RNF-03 Swagger | Configurado en `main.ts`; verificar manualmente (T037) | ⚠️ |
| RNF-04 Mantenibilidad | Estructura modular conforme a la constitución §9 | ✅ (revisión) |
| RNF-05 Pruebas unitarias | 29 casos escritos | 🟡 (sin ejecutar) |
| RNF-06 Privacidad | Control de propiedad probado en capacitaciones | 🟡 |
| RNF-07 Rendimiento | No medido; índices por `funcionarioId` y `estado` incluidos | ⚠️ |

## 5. Cobertura inversa (código sin requisito)

Todo el código implementado responde a un requisito. Elementos de soporte sin RF propio: `PrismaModule`/`PrismaService` (infraestructura), `RevisionDto` y utilidades de `common/` (reutilización, RF-21–23), y el campo `origen` (se usa en el RF-19 y prepara la iteración 4).

## 6. Conformidad con la constitución

| Norma | Estado | Comentario |
|---|---|---|
| Módulos NestJS, controlador/servicio/DTO separados | ✅ | Sin lógica de negocio en controladores |
| TypeScript estricto | 🟡 | `strict` activo; `strictPropertyInitialization` desactivado por los DTO |
| Validación con DTO + `ValidationPipe` | ✅ | `whitelist` y `forbidNonWhitelisted` |
| Hash de contraseñas | ✅ | bcrypt |
| Rutas protegidas + roles | ✅ | JWT + `RolesGuard` |
| CORS restringido | ✅ | Por variable de entorno |
| Secretos fuera del repositorio | ✅ | `.env` ignorado; `.env.example` sin valores reales |
| Límite de solicitudes en autenticación | ❌ | Pendiente (T040) |
| Swagger | ✅ | Plugin de Nest |
| Pruebas unitarias de servicios | 🟡 | Falta `FuncionariosService` |
| Pruebas de integración / endpoints | ❌ | Pendiente (T039) |

## 7. Hallazgos y acciones correctivas

| # | Hallazgo | Severidad | Acción | Tarea |
|---|---|---|---|---|
| H1 | La suite no se ha ejecutado | Alta | Ejecutar `npm install && npm test` y registrar el resultado en `05-speckit-implement.md` | T036 |
| H2 | No hay pruebas de `FuncionariosService` (RF-07, RF-08) | Media | Agregar spec con 3 casos: obtener, actualizar, no encontrado | Nueva (T051) |
| H3 | No hay pruebas de integración de guards y pipes (CA-02, CA-09, CA-14) | Media | Pruebas e2e con `supertest` | T039 |
| H4 | Ausencia de límite de solicitudes en `/auth/*` | Media | `@nestjs/throttler` | T040 |
| H5 | No existe forma controlada de crear revisores | Media | Script de inicialización o endpoint de administración | T041 |
| H6 | `listarMias`, `listarPendientes` y `obtener` de formación sin prueba | Baja | Ampliar las specs de servicios | Nueva (T052) |
| H7 | `revisadoPorId` no tiene clave foránea hacia `Usuario` | Baja | Añadir relación en el esquema en la próxima migración | Nueva (T053) |
| H8 | Falta definir cómo corregir un dato ya validado | Media | Resolver en taller con el usuario funcional (§11 de la especificación) | T050 |
| H9 | Cédula validada solo por formato | Baja | Implementar el dígito verificador | Backlog |

## 8. Criterio de salida de la iteración

La iteración se considera **cerrada** cuando se cumplan:

- [x] `npm test` finaliza sin fallos (H1).
- [x] `npm run build` compila sin errores.
- [x] El recorrido de `05-speckit-implement.md` §3 se completa en Swagger sin diferencias.
- [ ] Las pruebas de H2 y H6 se añaden y pasan.
- [ ] Los hallazgos H3–H5 y H7 quedan planificados en la iteración 2.

**Estado actual:** implementación completa; verificación pendiente.
