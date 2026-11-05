# PGHV-5: secciones por perfil
Alcance aprobado en el chat: backend, interfaz dinámica, configuración local y pruebas.
Se conserva NestJS, Prisma y PostgreSQL. Alternativas: React separado añade instalación y despliegue; interfaz estática servida por NestJS reutiliza la sesión API y no añade dependencias. Se adopta la segunda.
Una tabla PerfilConfiguracion mantiene reglas visible/obligatorio para datos_personales, formacion_academica y capacitacion por TipoFuncionario.
GET /api/v1/hoja-vida/parametrizacion obtiene el tipo desde el funcionario autenticado, nunca del cliente. GET/PUT /api/v1/perfiles/:tipo permite consultar/configurar solo a ADMIN y TALENTO_HUMANO.
La interfaz /app permite registro, ingreso, consulta de las secciones habilitadas, recarga y configuración autorizada. El token permanece en memoria. Cambiar visibilidad no elimina información y no sustituye las reglas existentes de autorización de datos.
Decisión provisional: los tres perfiles existentes empiezan con las tres secciones visibles; solo datos personales es obligatorio. La institución debe validar esta matriz. No se inventan diferencias por cargo. INVESTIGADOR no se incorpora sin definición funcional.
Esta historia no implementa UTIC, carga de diplomas, PDF ni CRUD nuevo de otras historias. Las listas muestran los registros existentes.
Sin reset de base, eliminación de volúmenes, push ni cambios de rama.
