import { BadRequestException, NotFoundException, ServiceUnavailableException, ValidationPipe } from '@nestjs/common';
import { TipoFuncionario } from '@prisma/client';
import { PerfilesService } from './perfiles.service';
import { ConfiguracionPerfilDto } from './perfil.dto';

const reglas = () => ({
  datos_personales: { visible: true, obligatorio: true },
  formacion_academica: { visible: true, obligatorio: false },
  capacitacion: { visible: false, obligatorio: false },
});
describe('PerfilesService', () => {
  const prisma: any = { funcionario: { findUnique: jest.fn() }, perfilConfiguracion: { findUnique: jest.fn(), update: jest.fn() } };
  const service = new PerfilesService(prisma);
  beforeEach(() => jest.resetAllMocks());
  it.each(Object.values(TipoFuncionario))('consulta las secciones del funcionario %s', async tipo => {
    prisma.funcionario.findUnique.mockResolvedValue({ tipoFuncionario: tipo });
    prisma.perfilConfiguracion.findUnique.mockResolvedValue({ tipoFuncionario: tipo, secciones: reglas() });
    expect(await service.paraFuncionario(7)).toEqual({ tipo_funcionario: tipo, secciones: reglas() });
  });
  it('rechaza un funcionario inexistente', async () => {
    prisma.funcionario.findUnique.mockResolvedValue(null);
    await expect(service.paraFuncionario(999)).rejects.toBeInstanceOf(NotFoundException);
  });
  it('no usa reglas inventadas si falta la configuración', async () => {
    prisma.perfilConfiguracion.findUnique.mockResolvedValue(null);
    await expect(service.obtener(TipoFuncionario.DOCENTE)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
  it('rechaza una sección oculta y obligatoria sin guardar', async () => {
    const secciones = reglas(); secciones.capacitacion.obligatorio = true;
    await expect(service.actualizar(TipoFuncionario.DOCENTE, { secciones })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.perfilConfiguracion.update).not.toHaveBeenCalled();
  });
  it('refleja cambios de configuración en una nueva consulta', async () => {
    let secciones = reglas();
    prisma.funcionario.findUnique.mockResolvedValue({ tipoFuncionario: TipoFuncionario.DOCENTE });
    prisma.perfilConfiguracion.findUnique.mockImplementation(async () => ({ tipoFuncionario: TipoFuncionario.DOCENTE, secciones }));
    prisma.perfilConfiguracion.update.mockImplementation(async ({ data }: any) => { secciones = data.secciones; return { tipoFuncionario: TipoFuncionario.DOCENTE, secciones }; });
    const nuevas = reglas(); nuevas.capacitacion.visible = true;
    await service.actualizar(TipoFuncionario.DOCENTE, { secciones: nuevas });
    expect((await service.paraFuncionario(7)).secciones.capacitacion.visible).toBe(true);
  });
});
describe('ConfiguracionPerfilDto', () => {
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
  const validar = (body: unknown) => pipe.transform(body, { type: 'body', metatype: ConfiguracionPerfilDto });
  it('acepta reglas booleanas completas', async () => {
    expect(await validar({ secciones: reglas() })).toEqual({ secciones: reglas() });
  });
  it.each([
    {}, { secciones: null }, { secciones: {} },
    { secciones: { ...reglas(), capacitacion: { visible: 'false', obligatorio: false } } },
    { secciones: { ...reglas(), otra: { visible: true, obligatorio: false } } },
  ])('rechaza configuraciones inválidas %j', async body => {
    await expect(validar(body)).rejects.toBeInstanceOf(BadRequestException);
  });
});
