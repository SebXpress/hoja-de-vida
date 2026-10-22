# Speckit-constitution

# Constitución del Proyecto: Gestor de Hoja de Vida Institucional

## 1. Nombre y propósito del proyecto

**Nombre:** Sistema web de gestión de hoja de vida (Gestor de Hoja de Vida).

**Propósito:** Permitir que cada funcionario de la institución (docentes, administrativos y directivos) registre y mantenga actualizada su hoja de vida en línea, sin depender del área de Talento Humano para cada actualización. El sistema centraliza información personal, formación académica, capacitación, experiencia docente, publicaciones y proyectos de investigación y vinculación; se interconecta con los módulos institucionales existentes y con fuentes externas para evitar la doble digitación; y produce la hoja de vida institucional en PDF y reportes para procesos de acreditación.

**Problema que resuelve:** La hoja de vida actual del ERP institucional está desactualizada. El funcionario no puede registrar sus capacitaciones, y Talento Humano se convierte en un cuello de botella por el volumen de empleados.

**Contexto:** Proyecto académico ejecutado por un equipo de estudiantes, con un usuario funcional de la Unidad de Docencia/Talento Humano y una contraparte técnica de UTIC (pendientes de asignación por el vicerrectorado).

## 2. Principios de desarrollo y calidad

- **Simplicidad:** La aplicación debe ser fácil de utilizar y comprender.
- **Modularidad:** Cada funcionalidad se organiza en módulos independientes según su responsabilidad.
- **Mantenibilidad:** El código debe ser legible, organizado y fácil de modificar.
- **Reutilización:** Se evitan las repeticiones innecesarias de código.
- **Calidad:** Las funcionalidades principales se prueban antes de su integración.
- **Usabilidad:** La interfaz debe ser clara, intuitiva y accesible.
- **Confiabilidad:** El sistema mantiene la integridad de los registros de funcionarios, formación, capacitaciones y sus estados de validación.
- **Separación de responsabilidades:** Los controladores gestionan las solicitudes HTTP, los servicios implementan la lógica de negocio y los módulos organizan los componentes.
- **Tipado estático:** Se utiliza TypeScript para reducir errores y mejorar la mantenibilidad.
- **Escalabilidad:** La arquitectura permite incorporar nuevos módulos sin afectar innecesariamente los existentes.
- **Integridad de datos:** Las operaciones respetan las relaciones y restricciones definidas en la base de datos.
- **Fuente única de verdad:** Cuando un dato exista en otro módulo institucional (investigación, vinculación, bus de datos de formación), se consume desde su fuente y no se duplica ni se edita manualmente.
- **Trazabilidad de la información:** Todo dato de la hoja de vida conserva su origen (manual o fuente externa), su estado de validación y quién lo revisó.
- **Desarrollo guiado por especificaciones (SDD):** Ninguna funcionalidad se implementa sin estar descrita en la especificación, planificada y desglosada en tareas.

## 3. Tecnologías que se utilizarán

- **NestJS:** Framework principal para desarrollar la API REST.
- **TypeScript:** Lenguaje de programación principal.
- **Node.js:** Entorno de ejecución del backend.
- **PostgreSQL:** Sistema de gestión de base de datos relacional.
- **Prisma ORM:** Herramienta para consultar y gestionar el esquema de la base de datos.
- **class-validator y class-transformer:** Validación y transformación de datos de entrada mediante DTO.
- **Passport y JWT:** Autenticación de usuarios.
- **bcrypt:** Hash de contraseñas.
- **Swagger / OpenAPI:** Documentación de los endpoints de la API.
- **Jest:** Pruebas unitarias y de integración.
- **Git:** Control de versiones del código fuente.

La selección de estas tecnologías responde a la necesidad de construir una aplicación sencilla, de bajo costo y adecuada para un proyecto académico.

## 4. Normas de programación

- Organizar el sistema mediante módulos de NestJS.
- Separar controladores, servicios, DTO y acceso a datos.
- Utilizar nombres descriptivos para clases, métodos, variables y archivos (el dominio se nombra en español).
- Mantener TypeScript en modo estricto siempre que las dependencias lo permitan.
- Validar los datos de entrada mediante DTO y `ValidationPipe` (`whitelist` y `forbidNonWhitelisted`).
- Evitar incluir lógica de negocio directamente en los controladores.
- Utilizar inyección de dependencias para administrar los servicios.
- Gestionar los errores mediante excepciones de NestJS (`BadRequestException`, `ForbiddenException`, etc.).
- Centralizar las configuraciones sensibles mediante variables de entorno.
- Documentar los endpoints y sus respuestas mediante Swagger.
- Evitar duplicar lógica; las utilidades compartidas viven en `src/common`.
- Los accesos a fuentes externas (otros módulos, bus de datos) se encapsulan detrás de una interfaz (puerto) para poder sustituirlos o simularlos en pruebas.

## 5. Normas de seguridad

- Validar y transformar los datos recibidos en las solicitudes.
- Rechazar propiedades no permitidas en los DTO.
- Utilizar consultas seguras mediante Prisma ORM; no construir SQL con entradas sin parametrizar.
- Almacenar contraseñas con un algoritmo de hash seguro (bcrypt); nunca en texto plano.
- Proteger las rutas privadas mediante autenticación (JWT) y autorización.
- Aplicar control de acceso basado en roles (`FUNCIONARIO`, `TALENTO_HUMANO`, `ADMIN`).
- El rol nunca se acepta desde una solicitud pública; el autorregistro siempre crea `FUNCIONARIO`.
- Validar la propiedad del registro en el servidor: un funcionario solo accede a su propia información, salvo los roles revisores.
- Los mensajes de autenticación no deben revelar si un correo existe.
- Configurar CORS únicamente para los orígenes autorizados.
- Mantener secretos y credenciales fuera del repositorio.
- No exponer contraseñas, hashes, tokens, secretos ni detalles internos en las respuestas.
- Utilizar HTTPS en los entornos desplegados.
- Aplicar límite de solicitudes en autenticación antes del despliegue.
- Tratar los datos personales (cédula, teléfono, dirección) conforme a la normativa de protección de datos personales aplicable.

## 6. Criterios funcionales generales

El sistema deberá permitir:

- Autenticar funcionarios y diferenciar sus permisos por rol.
- Que cada funcionario gestione sus datos personales, formación académica y capacitaciones.
- Adjuntar evidencia (diploma, certificado) a cada registro.
- Que Talento Humano revise y valide o rechace los registros con observación.
- Consolidar la hoja de vida de un funcionario con todos sus componentes.
- Parametrizar los componentes según el tipo de funcionario.
- Consumir información de otros módulos institucionales y del bus de datos de formación académica.
- Generar la hoja de vida institucional en PDF y reportes/dashboard para acreditación.

## 7. Criterios de calidad y aceptación

- Pruebas unitarias para la lógica de negocio de los servicios.
- Pruebas de integración para las operaciones de persistencia y sus reglas.
- Pruebas de los endpoints principales.
- Validación de los casos de error y de los datos inválidos.
- Verificación de los permisos de acceso a las rutas protegidas.
- Revisión de los flujos de validación (pendiente, validado, rechazado) y de las restricciones de edición.
- Ejecución satisfactoria de las pruebas antes de integrar cambios importantes.

## 8. API y convenciones HTTP

- Prefijo global `/api/v1`; documentación Swagger en `/api/docs`.
- Recursos en plural y en español, con minúsculas y guiones (`/capacitaciones`, `/formacion-academica`).
- Verbos: `POST` crea (201), `GET` consulta (200), `PATCH` modifica parcialmente (200), `DELETE` elimina (200).
- Códigos de error: `400` datos inválidos, `401` sin autenticar, `403` sin permiso, `404` no existe, `409` conflicto (duplicados).
- Autenticación mediante cabecera `Authorization: Bearer <token>`.
- Las acciones de flujo se expresan como subrecurso (`PATCH /capacitaciones/:id/revision`).
- Las fechas viajan en formato ISO 8601.

## 9. Organización del proyecto

```
src/
├── main.ts
├── app.module.ts
├── prisma/                  # PrismaService y PrismaModule (global)
├── common/                  # decoradores, guards, DTO y utilidades compartidas
├── auth/                    # registro, login, estrategia JWT
├── funcionarios/            # datos personales del funcionario
├── capacitaciones/          # CRUD y revisión de capacitaciones
├── formacion-academica/     # CRUD y revisión de formación académica
├── hoja-de-vida/            # consolidación de la hoja de vida
└── (futuros) experiencia-docente/, publicaciones/, integraciones/, reportes/
prisma/schema.prisma
docs/                        # documentos Speckit
```

Cada módulo contiene sus controladores, servicios, DTO y pruebas, sin crear archivos innecesarios. La estructura puede evolucionar manteniendo la separación de responsabilidades.

## 10. Criterios de aceptación del proyecto

- La API inicia correctamente en el entorno configurado.
- La conexión con PostgreSQL funciona correctamente.
- Los endpoints principales realizan las operaciones previstas.
- Los DTO validan adecuadamente los datos de entrada.
- Las reglas de negocio impiden operaciones inválidas.
- Las rutas protegidas comprueban identidad y permisos.
- Las pruebas automatizadas principales se ejecutan satisfactoriamente.
- Swagger refleja los endpoints implementados.
- Las credenciales y secretos no están expuestos en el repositorio.
- El código respeta la organización modular y las normas definidas.

## 11. Mantenimiento y evolución

El sistema se diseña para agregar funcionalidades sin modificar innecesariamente el código existente. Los cambios importantes se registran mediante Git y se comprueban con pruebas antes de incorporarse a la rama principal. El proyecto avanza por iteraciones; cada una pasa por las fases SDD (constitución, especificación, planificación, tareas, implementación y auditoría de cobertura).

## 12. Cumplimiento de la constitución

Todas las funcionalidades nuevas y modificaciones deben respetar los principios, tecnologías, normas de programación, medidas de seguridad y criterios de calidad de este documento. Cualquier cambio importante en estas reglas se documenta y justifica antes de su aplicación.

---

**Versión:** 1.1
**Proyecto:** Gestor de Hoja de Vida Institucional
**Lenguaje:** TypeScript
**Arquitectura:** API REST modular con NestJS
**Tipo de documento:** Constitución del proyecto de software

