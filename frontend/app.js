'use strict';
const $ = id => document.getElementById(id);
const { sections, visibleSections } = window.ResumeSections;
let token = null, user = null, registering = false, requestId = 0, configId = 0;
const message = (text = '', error = false) => { $('status').textContent = text; $('status').className = error ? 'error' : ''; };
function endSession() {
  token = null; user = null; requestId++; configId++;
  $('workspace').hidden = true; $('admin').hidden = true; $('auth').hidden = false;
  $('content').replaceChildren(); $('tabs').replaceChildren(); $('rules').replaceChildren(); $('identity').textContent = '';
}
async function api(path, options = {}) {
  const response = await fetch('/api/v1/' + path, {
    ...options, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) { endSession(); throw new Error('Tu sesión expiró. Ingresa nuevamente.'); }
    throw new Error(Array.isArray(data.message) ? data.message.join('. ') : data.message || 'No se pudo completar la solicitud');
  }
  return data;
}
function node(tag, text, className) { const n = document.createElement(tag); n.textContent = text; if (className) n.className = className; return n; }
$('toggle-register').onclick = () => {
  registering = !registering; $('registration').hidden = !registering; $('registration').disabled = !registering;
  for (const name of ['nombres', 'apellidos', 'cedula']) $('login-form').elements[name].required = registering;
  $('auth-title').textContent = registering ? 'Crea tu cuenta' : 'Ingresa a tu cuenta';
  $('submit-auth').textContent = registering ? 'Registrarme' : 'Ingresar';
  $('toggle-register').textContent = registering ? 'Ya tengo una cuenta' : 'Crear una cuenta'; message();
};
$('login-form').onsubmit = async event => {
  event.preventDefault(); $('submit-auth').disabled = true; message();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  try {
    if (registering) await api('auth/register', { method: 'POST', body: JSON.stringify(values) });
    const session = await api('auth/login', { method: 'POST', body: JSON.stringify({ email: values.email, password: values.password }) });
    token = session.accessToken;
    const me = await api('funcionarios/mi-perfil');
    // El rol solo controla la presentación. Los permisos reales se verifican en el backend.
    const claims = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    user = { ...me, rol: claims.rol };
    $('login-form').reset(); $('auth').hidden = true; $('workspace').hidden = false;
    $('identity').textContent = `${me.nombres} ${me.apellidos} · ${me.tipoFuncionario}`;
    $('admin').hidden = !['ADMIN', 'TALENTO_HUMANO'].includes(user.rol);
    await refresh(); if (!$('admin').hidden) await loadRules();
  } catch (error) { if (!user) endSession(); message(error.message, true); }
  finally { $('submit-auth').disabled = false; }
};
async function refresh() {
  const current = ++requestId; $('refresh').disabled = true; $('tabs').replaceChildren(); $('content').replaceChildren();
  message('Cargando secciones…');
  try {
    const config = await api('hoja-vida/parametrizacion'); if (current !== requestId) return;
    const visible = visibleSections(config.secciones);
    for (const section of visible) {
      const button = node('button', section.label + (config.secciones[section.id].obligatorio ? ' · Obligatoria' : ''));
      button.type = 'button'; button.onclick = () => openSection(section, button); $('tabs').append(button);
    }
    message();
    if (visible.length) $('tabs').firstElementChild.click();
    else $('content').append(node('h2', 'No hay secciones habilitadas'), node('p', 'Contacta a Talento Humano para revisar la configuración de tu perfil.'));
  } catch (error) { if (current === requestId || !token) message(error.message, true); }
  finally { $('refresh').disabled = false; }
}
async function openSection(section, button) {
  const current = ++requestId;
  for (const tab of $('tabs').children) tab.removeAttribute('aria-current');
  button.setAttribute('aria-current', 'page'); $('content').replaceChildren(node('h2', section.label), node('p', 'Cargando información…'));
  $('content').setAttribute('aria-busy', 'true'); message();
  try {
    const data = await api(section.endpoint); if (current !== requestId) return;
    $('content').replaceChildren(node('h2', section.label));
    if (section.id === 'datos_personales') {
      const dl = document.createElement('dl');
      for (const [key, label] of Object.entries({ nombres: 'Nombres', apellidos: 'Apellidos', cedula: 'Cédula', tipoFuncionario: 'Perfil', telefono: 'Teléfono', direccion: 'Dirección', cargo: 'Cargo', departamento: 'Departamento' })) dl.append(node('dt', label), node('dd', data[key] || 'Sin registrar'));
      $('content').append(dl);
    } else {
      if (!data.length) $('content').append(node('p', 'Todavía no tienes registros en esta sección.'));
      for (const item of data) {
        const article = node('article', '', 'record');
        article.append(node('h3', item.titulo || item.nombre), node('p', item.institucion), node('span', item.estado, 'badge'));
        if (item.horas) article.append(node('p', `${item.horas} horas`));
        $('content').append(article);
      }
    }
  } catch (error) { if (current === requestId) { $('content').replaceChildren(node('h2', section.label), node('p', error.message, 'error')); } else if (!token) message(error.message, true); }
  finally { if (current === requestId) $('content').setAttribute('aria-busy', 'false'); }
}
async function loadRules() {
  const current = ++configId; $('rules').replaceChildren(); $('config-form').querySelector('button').disabled = true;
  try {
    const config = await api('perfiles/' + $('config-type').value); if (current !== configId) return;
    for (const section of sections) {
      const row = node('div', '', 'rule'); row.append(node('strong', section.label));
      for (const [key, label] of [['visible', 'Visible'], ['obligatorio', 'Obligatoria']]) {
        const wrapper = node('label', label); const input = document.createElement('input'); input.type = 'checkbox'; input.name = `${section.id}.${key}`; input.checked = config.secciones[section.id][key]; wrapper.prepend(input); row.append(wrapper);
      }
      const [visible, required] = row.querySelectorAll('input');
      visible.onchange = () => { if (!visible.checked) required.checked = false; };
      required.onchange = () => { if (required.checked) visible.checked = true; };
      $('rules').append(row);
    }
    $('config-form').querySelector('button').disabled = false;
  } catch (error) { message(error.message, true); }
}
$('config-form').onsubmit = async event => {
  event.preventDefault(); const submit = event.currentTarget.querySelector('button'); submit.disabled = true;
  const tipo = $('config-type').value;
  const secciones = Object.fromEntries(sections.map(({ id }) => [id, Object.fromEntries(['visible', 'obligatorio'].map(key => [key, event.currentTarget.elements[`${id}.${key}`].checked]))]));
  try { await api('perfiles/' + tipo, { method: 'PUT', body: JSON.stringify({ secciones }) }); await refresh(); message('Configuración guardada. Los demás usuarios verán el cambio al actualizar sus secciones.'); }
  catch (error) { message(error.message, true); }
  finally { submit.disabled = false; }
};
$('config-type').onchange = loadRules;
$('refresh').onclick = refresh;
$('logout').onclick = () => { endSession(); message('Sesión cerrada.'); };
