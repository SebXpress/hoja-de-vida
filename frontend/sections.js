(function (root) {
  const sections = [
    { id: 'datos_personales', label: 'Información personal', endpoint: 'funcionarios/mi-perfil' },
    { id: 'formacion_academica', label: 'Formación académica', endpoint: 'formacion-academica/mias' },
    { id: 'capacitacion', label: 'Capacitación', endpoint: 'capacitaciones/mias' },
  ];
  function visibleSections(rules) { return sections.filter(section => rules?.[section.id]?.visible === true); }
  const api = { sections, visibleSections };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ResumeSections = api;
})(typeof window !== 'undefined' ? window : globalThis);
