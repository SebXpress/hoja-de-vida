/* Ejecutar desde la raíz: node scripts/smoke-perfiles.cjs. Usa usuarios temporales y restaura las reglas. */
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const { PrismaClient } = require('@prisma/client');
// Prisma carga DATABASE_URL desde .env a través de su cliente generado.
const prisma = new PrismaClient();
const port = 3105;
const base = `http://127.0.0.1:${port}`;
const ids = [], originals = [];
let checks = 0;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function request(path, { token, body, method = 'GET', status = 200 } = {}) {
  const response = await fetch(base + '/api/v1/' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(data)}`); checks++;
  return data;
}
const server = spawn(process.execPath, ['dist/main.js'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
let log = ''; server.stdout.on('data', d => { log += d; }); server.stderr.on('data', d => { log += d; });
(async () => {
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (server.exitCode !== null) throw new Error('Backend no inició: ' + log);
      try { ready = (await fetch(base + '/app/')).ok; } catch {}
      if (ready) break;
      await pause(500);
    }
    assert(ready, 'Backend no disponible'); checks++;
    await request('hoja-vida/parametrizacion', { status: 401 });
    const suffix = randomBytes(8).toString('hex');
    const password = randomBytes(16).toString('hex') + 'A1';
    const accounts = [];
    for (const tipo of ['DOCENTE', 'ADMINISTRATIVO', 'DIRECTIVO']) {
      const email = `smoke-${tipo.toLowerCase()}-${suffix}@example.invalid`;
      const body = { email, password, nombres: 'Prueba', apellidos: tipo, cedula: String(BigInt('0x' + randomBytes(6).toString('hex')) % 10000000000n).padStart(10, '0'), tipoFuncionario: tipo };
      const registered = await request('auth/register', { method: 'POST', body, status: 201 }); ids.push(registered.id);
      const session = await request('auth/login', { method: 'POST', body: { email, password } });
      const config = await request('hoja-vida/parametrizacion', { token: session.accessToken });
      assert.equal(config.tipo_funcionario, tipo); assert.equal(Object.keys(config.secciones).length, 3);
      const me = await request('funcionarios/mi-perfil', { token: session.accessToken });
      accounts.push({ tipo, email, token: session.accessToken, me });
      originals.push(await prisma.perfilConfiguracion.findUniqueOrThrow({ where: { tipoFuncionario: tipo } }));
      await request('perfiles/' + tipo, { token: session.accessToken, status: 403 });
      await request('perfiles/' + tipo, { token: session.accessToken, method: 'PUT', body: { secciones: config.secciones }, status: 403 });
    }
    for (const [index, rol] of ['ADMIN', 'TALENTO_HUMANO'].entries()) {
      const account = accounts[index];
      await prisma.usuario.update({ where: { id: ids[index] }, data: { rol } });
      const session = await request('auth/login', { method: 'POST', body: { email: account.email, password } });
      const token = session.accessToken;
      const target = accounts[2];
      const config = await request('perfiles/' + target.tipo, { token });
      config.secciones.capacitacion = { visible: false, obligatorio: false };
      await request('perfiles/' + target.tipo, { token, method: 'PUT', body: { secciones: config.secciones } });
      const refreshed = await request('hoja-vida/parametrizacion', { token: target.token });
      assert.equal(refreshed.secciones.capacitacion.visible, false);
      assert.deepEqual(await request('funcionarios/mi-perfil', { token: target.token }), target.me);
      config.secciones.capacitacion.obligatorio = true;
      await request('perfiles/' + target.tipo, { token, method: 'PUT', body: { secciones: config.secciones }, status: 400 });
      await request('perfiles/INVALIDO', { token, status: 400 });
      await request('perfiles/' + target.tipo, { token, method: 'PUT', body: { secciones: {} }, status: 400 });
    }
    console.log(`PASS: ${checks} comprobaciones HTTP; 3 perfiles, JWT, roles, validación, recarga y conservación de datos.`);
  } finally {
    for (const config of originals) await prisma.perfilConfiguracion.update({ where: { tipoFuncionario: config.tipoFuncionario }, data: { secciones: config.secciones, updatedAt: config.updatedAt } });
    if (ids.length) {
      await prisma.funcionario.deleteMany({ where: { usuarioId: { in: ids } } });
      await prisma.usuario.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.$disconnect(); server.kill();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
