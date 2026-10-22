import { NotFoundException } from '@nestjs/common';
import { HojaDeVidaService } from './hoja-de-vida.service';

describe('HojaDeVidaService', () => {
  const prisma: any = { funcionario: { findUnique: jest.fn() } };
  const service = new HojaDeVidaService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('lanza NotFound si el funcionario no existe', async () => {
    prisma.funcionario.findUnique.mockResolvedValue(null);
    await expect(service.consolidar(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('consolida datos y calcula el resumen de horas', async () => {
    prisma.funcionario.findUnique.mockResolvedValue({
      id: 1,
      nombres: 'Ana',
      capacitaciones: [{ horas: 40 }, { horas: 20 }],
      formaciones: [{ id: 1 }],
    });
    const res = await service.consolidar(1);
    expect(res.resumen).toEqual({
      totalFormaciones: 1,
      totalCapacitaciones: 2,
      horasCapacitacion: 60,
    });
    expect(res.datosPersonales).toEqual({ id: 1, nombres: 'Ana' });
  });

  it('filtra por registros validados cuando se solicita', async () => {
    prisma.funcionario.findUnique.mockResolvedValue({ id: 1, capacitaciones: [], formaciones: [] });
    await service.consolidar(1, true);
    const include = prisma.funcionario.findUnique.mock.calls[0][0].include;
    expect(include.capacitaciones.where).toEqual({ estado: 'VALIDADO' });
    expect(include.formaciones.where).toEqual({ estado: 'VALIDADO' });
  });
});
