// Herramienta local de administración. No se expone por HTTP.
const { PrismaClient, Rol } = require('@prisma/client');
const prisma = new PrismaClient();
const [email, rol] = process.argv.slice(2);
(async () => {
  try {
    if (!email || !Object.values(Rol).includes(rol)) throw new Error('Uso: node scripts/asignar-rol.cjs correo@institucion.edu.ec TALENTO_HUMANO|ADMIN|FUNCIONARIO');
    const user = await prisma.usuario.update({ where: { email: email.toLowerCase() }, data: { rol }, select: { email: true, rol: true } });
    console.log(`Rol actualizado para ${user.email}: ${user.rol}. Cierra sesión e ingresa nuevamente.`);
  } finally { await prisma.$disconnect(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
