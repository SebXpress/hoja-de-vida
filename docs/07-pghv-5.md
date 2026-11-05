# PGHV-5: guía de ejecución y verificación

## Iniciar en PowerShell desde la raíz del proyecto
```powershell
docker compose up -d
npx.cmd prisma generate
npx.cmd prisma migrate deploy
npm.cmd run start:dev
```
Si PowerShell no encuentra npm/npx, usa las rutas de instalación:
```powershell
& 'C:/Program Files/nodejs/node.exe' node_modules/prisma/build/index.js generate
& 'C:/Program Files/nodejs/node.exe' node_modules/prisma/build/index.js migrate deploy
& 'C:/Program Files/nodejs/node.exe' node_modules/@nestjs/cli/bin/nest.js start --watch
```

Abre http://localhost:3000/app/ y crea tu cuenta. La sesión se mantiene en memoria y se vuelve a solicitar al recargar la página. Swagger está en http://localhost:3000/api/docs.

## Configurar perfiles
El registro público solo crea FUNCIONARIO. Para probar el panel de gestión con una cuenta local ya registrada, un administrador puede ejecutar:
```powershell
node scripts/asignar-rol.cjs tu-correo@institucion.edu.ec TALENTO_HUMANO
```
Si `node` no está en PATH, sustituirlo por `& 'C:/Program Files/nodejs/node.exe'`.
Cierra sesión y vuelve a ingresar. En Configurar secciones selecciona un perfil, activa Visible/Obligatoria y guarda. Un funcionario de ese perfil verá los cambios al pulsar Actualizar secciones o ingresar nuevamente. Una sección obligatoria no puede ocultarse. Cambiar reglas no modifica ni borra datos de la hoja de vida.

Los tres perfiles existentes empiezan con las mismas tres secciones visibles; únicamente Información personal es obligatoria. Esta matriz inicial es provisional y necesita validación funcional. El PDF también menciona investigador, que no existe en el modelo actual; no se añade sin una definición institucional.

## API
- GET /api/v1/hoja-vida/parametrizacion: perfil del funcionario autenticado, sin parámetro de usuario.
- GET /api/v1/perfiles/:tipo: consulta para ADMIN/TALENTO_HUMANO.
- PUT /api/v1/perfiles/:tipo: reemplazo completo de reglas, mismos roles.
- Tipos: DOCENTE, ADMINISTRATIVO, DIRECTIVO.
- Cuerpo PUT: `{"secciones":{"datos_personales":{"visible":true,"obligatorio":true},"formacion_academica":{"visible":true,"obligatorio":false},"capacitacion":{"visible":false,"obligatorio":false}}}`.

## Verificar
```powershell
npm.cmd test -- --runInBand
npm.cmd run build
node scripts/smoke-perfiles.cjs
```
El smoke usa puerto 3105, cuentas temporales y restaura las reglas originales al terminar. Ejecutarlo contra una base de desarrollo, sin cambios concurrentes de configuración. Las capturas pghv-5-desktop.png y pghv-5-mobile.png muestran una cuenta temporal con Capacitación oculta para verificar el comportamiento; no son la matriz inicial.

## Alcance y pendientes
Esta entrega cubre PGHV-5: consulta y configuración persistida, interfaz dinámica y validación de tipos. Las marcas de obligatoriedad son reglas de sección, no validaciones nuevas de campos de formularios ajenos a esta historia. Ocultar pestañas no sustituye la autorización de datos de los módulos existentes. La interfaz muestra datos personales y listas existentes; no añade UTIC, diplomas PDF, exportación PDF ni formularios CRUD de otras historias.
La especificación anterior docs/02-speckit-specify.md corresponde a un MVP distinto. Para esta entrega, la parametrización pertenece a Sprint 1, según el PDF ampliado y Jira PGHV-5. No debe interpretarse que todo el PDF ampliado está implementado.
El estado de Jira no se modifica desde esta implementación. `.env` permanece ignorado por Git y nunca debe publicarse.

## Evidencia de esta entrega (5 de noviembre de 2026)
- Jest: 7 suites, 44 pruebas aprobadas.
- NestJS build: código de salida 0.
- Smoke HTTP real: 36 comprobaciones aprobadas, incluidas autenticación, permisos ADMIN/TALENTO_HUMANO, rechazo de reglas inválidas y conservación de datos.
- Chrome sin ventana: perfiles DOCENTE/ADMINISTRATIVO/DIRECTIVO, ocultar sección y recargar, listas vacías, cierre de sesión, guardado desde panel de Talento Humano y ancho móvil 390 px sin desbordamiento; sin errores JavaScript.
- Regresión reproducida y corregida: un dato inválido de registro ya no bloquea ingreso tras volver al formulario de login.
- Revisión independiente: hallazgo anterior corregido; sin hallazgos importantes adicionales.
- PostgreSQL healthy; dos migraciones aplicadas; esquema actualizado; .env ignorado por Git.
- Usuarios temporales de pruebas eliminados y matriz inicial restaurada.
- Entrega preparada en PGHV-5-parametrizacion-perfiles; commit y push autorizados por el usuario.
