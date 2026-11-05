// @ts-ignore Módulo compartido con el navegador, sin dependencias de DOM.
import { visibleSections } from '../../frontend/sections';
describe('pestañas por perfil', () => {
  it('no incluye secciones ocultas ni desconocidas', () => {
    expect(visibleSections({ datos_personales: { visible: true }, capacitacion: { visible: false }, desconocida: { visible: true } }).map((s: any) => s.id)).toEqual(['datos_personales']);
  });
  it('permite una configuración sin secciones visibles', () => { expect(visibleSections({})).toEqual([]); });
});
