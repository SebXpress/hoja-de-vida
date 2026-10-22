# Speckit-specify

# Especificación: Gestor de Hoja de Vida Institucional

**Versión:** 1.0 · **Alcance de esta iteración:** Iteración 1 (MVP) · **Fuente:** reunión de levantamiento con la coordinación del proyecto

## 1. Contexto y problema

La institución cuenta con un ERP con un reporte de hoja de vida, pero la información está desactualizada. Hoy el funcionario no puede registrar por sí mismo sus capacitaciones (fecha, diploma); debe solicitarlo a Talento Humano, que no da abasto por la cantidad de empleados. Además, parte de la información ya existe en otros módulos (investigación, vinculación) y en el bus de datos de formación académica, pero no se aprovecha.

## 2. Objetivos

- **O1.** Permitir que el funcionario ingrese y actualice su información de forma autónoma.
- **O2.** Garantizar la confiabilidad de la información mediante validación por Talento Humano.
- **O3.** Obtener automáticamente información de fuentes institucionales y externas (iteraciones posteriores).
- **O4.** Generar la hoja de vida institucional en PDF y reportes para acreditación (iteraciones posteriores).

## 3. Actores

| Actor | Descripción |
|---|---|
| **Funcionario** | Docente, administrativo o directivo que gestiona su propia hoja de vida. |
| **Talento Humano (revisor)** | Revisa y valida o rechaza los registros de los funcionarios. |
| **Administrador** | Gestiona el sistema; tiene los permisos del revisor. |
| **Sistemas externos** | Módulos de investigación, vinculación y bus de datos de formación (fuera de la iteración 1). |

## 4. Alcance por iteraciones

| Iteración | Contenido |
|---|---|
| **1 (esta)** | Autenticación y roles; datos personales; formación académica; capacitaciones con evidencia; flujo de validación; consolidado de hoja de vida (JSON). |
| 2 | Experiencia docente; carga de archivos de evidencia; generación de PDF de la hoja de vida; parametrización por tipo de funcionario. |
| 3 | Integración con módulos de investigación y vinculación (publicaciones y proyectos). |
| 4 | Integración con el bus de datos de formación académica; dashboard y reportería de acreditación. |

**Fuera de alcance de la iteración 1:** PDF, dashboard, integraciones externas, carga física de archivos, experiencia docente, publicaciones y proyectos, frontend.

## 5. Historias de usuario

**HU-01 Registro e ingreso.** Como funcionario, quiero crear mi cuenta e iniciar sesión para acceder a mi hoja de vida.

**HU-02 Datos personales.** Como funcionario, quiero consultar y actualizar mis datos personales y laborales para mantenerlos al día.

**HU-03 Registrar capacitaciones.** Como funcionario, quiero registrar mis capacitaciones con fechas, horas y enlace a mi certificado para no depender de Talento Humano.

**HU-04 Registrar formación académica.** Como funcionario, quiero registrar mis títulos académicos para que consten en mi hoja de vida.

**HU-05 Corregir registros.** Como funcionario, quiero modificar o eliminar registros que aún no han sido validados para corregir errores.

**HU-06 Validar información.** Como revisor de Talento Humano, quiero validar o rechazar (con observación) los registros de los funcionarios para asegurar la confiabilidad.

**HU-07 Bandeja de pendientes.** Como revisor, quiero listar las capacitaciones pendientes de revisión para gestionarlas ordenadamente.

**HU-08 Hoja de vida consolidada.** Como funcionario o revisor, quiero obtener la hoja de vida consolidada con un resumen para usarla en reportes, pudiendo filtrar solo los registros validados.

## 6. Requisitos funcionales

### Autenticación y seguridad
- **RF-01.** El sistema permitirá el autorregistro con correo, contraseña, nombres, apellidos, cédula y tipo de funcionario.
- **RF-02.** El correo y la cédula deben ser únicos; un duplicado se rechaza con conflicto.
- **RF-03.** El autorregistro siempre asigna el rol `FUNCIONARIO`.
- **RF-04.** El inicio de sesión devuelve un token JWT con identidad, rol y funcionario asociado.
- **RF-05.** Las credenciales inválidas se rechazan con un mensaje genérico.
- **RF-06.** Todas las rutas, excepto registro e inicio de sesión, requieren autenticación.

### Datos personales
- **RF-07.** El funcionario puede consultar y modificar sus nombres, apellidos, teléfono, dirección, cargo y departamento.
- **RF-08.** La cédula y el tipo de funcionario no son modificables por el propio funcionario.

### Capacitaciones
- **RF-09.** El funcionario puede crear capacitaciones con nombre, institución, fecha de inicio y fin, horas y enlace de evidencia.
- **RF-10.** La fecha de fin no puede ser anterior a la de inicio ni futura.
- **RF-11.** Las horas deben ser un entero entre 1 y 5000; la evidencia debe ser una URL válida.
- **RF-12.** Toda capacitación nueva queda en estado `PENDIENTE`.
- **RF-13.** El funcionario lista sus capacitaciones, ordenadas de la más reciente a la más antigua.
- **RF-14.** Solo el propietario puede modificar o eliminar una capacitación; los revisores pueden consultarla.
- **RF-15.** Un registro `VALIDADO` no puede modificarse ni eliminarse.
- **RF-16.** Al modificar un registro `RECHAZADO`, este vuelve a `PENDIENTE` y se limpia la observación.

### Formación académica
- **RF-17.** El funcionario puede registrar formación con nivel (técnico, tercer nivel, especialización, maestría, doctorado), título, institución, país, fecha de obtención y, opcionalmente, número de registro SENESCYT y evidencia.
- **RF-18.** La fecha de obtención no puede ser futura.
- **RF-19.** Los registros ingresados manualmente se marcan con origen `MANUAL` (se reserva `BUS_DATOS` para la integración futura).
- **RF-20.** Rigen las mismas reglas de propiedad, estado y edición que en capacitaciones (RF-12 a RF-16).

### Validación
- **RF-21.** Solo `TALENTO_HUMANO` y `ADMIN` pueden validar o rechazar registros.
- **RF-22.** Rechazar exige una observación no vacía.
- **RF-23.** La revisión registra el estado, la observación, el revisor y la fecha.
- **RF-24.** Los revisores pueden listar las capacitaciones en estado `PENDIENTE`.

### Hoja de vida consolidada
- **RF-25.** El funcionario obtiene su hoja de vida consolidada: datos personales, formación, capacitaciones y resumen (totales y horas de capacitación).
- **RF-26.** Los revisores obtienen la hoja de vida de cualquier funcionario.
- **RF-27.** Se puede filtrar para incluir solo registros `VALIDADO`.

## 7. Requisitos no funcionales

- **RNF-01 Seguridad:** contraseñas con hash bcrypt; JWT con expiración; CORS restringido; la respuesta nunca incluye el hash.
- **RNF-02 Validación:** el DTO rechaza propiedades no declaradas.
- **RNF-03 Documentación:** todos los endpoints visibles en Swagger.
- **RNF-04 Mantenibilidad:** arquitectura modular, lógica de negocio solo en servicios.
- **RNF-05 Calidad:** pruebas unitarias de la lógica de negocio.
- **RNF-06 Privacidad:** un funcionario no accede a registros de otros.
- **RNF-07 Rendimiento:** las listas del funcionario responden en menos de 1 s con hasta 500 registros (indicativo).

## 8. Entidades del dominio

| Entidad | Atributos principales |
|---|---|
| **Usuario** | email (único), contraseña (hash), rol, activo |
| **Funcionario** | nombres, apellidos, cédula (única), teléfono, dirección, tipo, cargo, departamento |
| **Capacitación** | nombre, institución, fechas, horas, evidencia, estado, observación, revisor, fecha de revisión |
| **Formación académica** | nivel, título, institución, país, fecha, nº registro SENESCYT, origen, evidencia, estado |

**Estados de validación:** `PENDIENTE → VALIDADO | RECHAZADO`; `RECHAZADO → PENDIENTE` (al corregir). `VALIDADO` es final para el funcionario.

## 9. Criterios de aceptación (Dado / Cuando / Entonces)

- **CA-01** (RF-02) *Dado* un correo ya registrado, *cuando* otra persona se registra con él, *entonces* recibe 409.
- **CA-02** (RF-03) *Dado* un registro público, *cuando* envía un campo `rol`, *entonces* se rechaza la propiedad y el usuario nunca es administrador.
- **CA-03** (RF-05) *Dado* una contraseña incorrecta o un correo inexistente, *cuando* se inicia sesión, *entonces* recibe 401 con el mismo mensaje.
- **CA-04** (RF-10) *Dado* fecha fin anterior a inicio, *cuando* se crea una capacitación, *entonces* recibe 400 y no se guarda nada.
- **CA-05** (RF-12) *Dado* un funcionario autenticado, *cuando* crea una capacitación válida, *entonces* queda asociada a él en estado `PENDIENTE`.
- **CA-06** (RF-14) *Dado* un funcionario B, *cuando* intenta modificar o ver una capacitación de A, *entonces* recibe 403.
- **CA-07** (RF-15) *Dado* un registro `VALIDADO`, *cuando* el propietario intenta modificarlo o eliminarlo, *entonces* recibe 403.
- **CA-08** (RF-16) *Dado* un registro `RECHAZADO`, *cuando* el propietario lo corrige, *entonces* vuelve a `PENDIENTE` sin observación.
- **CA-09** (RF-21) *Dado* un `FUNCIONARIO`, *cuando* llama a `/revision` o `/pendientes`, *entonces* recibe 403.
- **CA-10** (RF-22) *Dado* un revisor, *cuando* rechaza sin observación, *entonces* recibe 400.
- **CA-11** (RF-23) *Dado* un revisor, *cuando* valida un registro, *entonces* quedan guardados el revisor y la fecha.
- **CA-12** (RF-18) *Dado* una fecha de obtención futura, *cuando* se registra formación, *entonces* recibe 400.
- **CA-13** (RF-25, RF-27) *Dado* un funcionario con registros de varios estados, *cuando* consulta su hoja con `soloValidados=true`, *entonces* solo aparecen los validados y el resumen es coherente.
- **CA-14** (RF-06) *Dado* una solicitud sin token, *cuando* accede a cualquier ruta protegida, *entonces* recibe 401.

## 10. Reglas de negocio

- **RN-01** Un funcionario es dueño de sus registros; nadie más puede alterarlos.
- **RN-02** La validación es potestad exclusiva de Talento Humano y Administración.
- **RN-03** Un dato validado es inmutable para el funcionario (para cambiarlo debe intervenir un revisor — a definir).
- **RN-04** Todo cambio hecho por el funcionario reinicia el ciclo de validación.
- **RN-05** Un rechazo debe ser justificado.

## 11. Puntos por aclarar con el usuario funcional

Quedan abiertos para los talleres presenciales con la persona que designe el vicerrectorado:

1. **[CLARIFICAR]** ¿Qué campos exactos forman la hoja de vida según el tipo de funcionario (docente, administrativo, directivo)?
2. **[CLARIFICAR]** ¿Cómo se corrige un dato ya validado que cambió? (¿lo revierte Talento Humano?)
3. **[CLARIFICAR]** ¿Los tipos de capacitación o formación requieren un catálogo (cursos internos, externos, horas mínimas)?
4. **[CLARIFICAR]** ¿Cómo se autenticará finalmente: cuentas propias o SSO institucional del ERP?
5. **[CLARIFICAR]** Formato y contenido oficial del PDF de la hoja de vida institucional.
6. **[CLARIFICAR]** Indicadores exactos del dashboard de acreditación (ejemplo dado: PhD vinculados en los últimos seis meses).
7. **[CLARIFICAR]** Detalle técnico (API/bus de datos) de los módulos de investigación y vinculación; lo proporcionará la contraparte de UTIC.
8. **[CLARIFICAR]** Política de retención y protección de datos personales aplicable.

## 12. Supuestos de la iteración 1

- La evidencia se registra como enlace (URL); la carga de archivos llega en la iteración 2.
- Las cuentas de revisor (`TALENTO_HUMANO`, `ADMIN`) se crean directamente en la base de datos o mediante un script de inicialización.
- La autenticación es propia del sistema hasta definir la integración con el ERP.
