import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { FormacionAcademicaService } from './formacion-academica.service';

describe('FormacionAcademicaService', () => {
  const prisma: any = {
    formacionAcademica: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const user: any = { id: 1, email: 'f@u.ec', rol: 'FUNCIONARIO', funcionarioId: 10 };
  const th: any = { id: 3, email: 'th@u.ec', rol: 'TALENTO_HUMANO', funcionarioId: 30 };
  let service: FormacionAcademicaService;

  const dto: any = {
    nivel: 'MAESTRIA',
    titulo: 'Magíster en Ingeniería de Software',
    institucion: 'EPN',
    pais: 'Ecuador',
    fechaObtencion: '2020-06-30',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FormacionAcademicaService(prisma);
  });

  it('crea el registro con origen MANUAL y funcionario autenticado', async () => {
    prisma.formacionAcademica.create.mockResolvedValue({ id: 1 });
    await service.crear(user, dto);
    const data = prisma.formacionAcademica.create.mock.calls[0][0].data;
    expect(data.origen).toBe('MANUAL');
    expect(data.funcionarioId).toBe(10);
  });

  it('rechaza fecha de obtención futura', async () => {
    const futura = new Date(Date.now() + 86400000 * 60).toISOString();
    await expect(
      service.crear(user, { ...dto, fechaObtencion: futura }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prohíbe modificar un título validado', async () => {
    prisma.formacionAcademica.findUnique.mockResolvedValue({
      id: 5,
      funcionarioId: 10,
      estado: 'VALIDADO',
      fechaObtencion: new Date('2020-06-30'),
    });
    await expect(service.actualizar(user, 5, { pais: 'Perú' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('exige observación al rechazar', async () => {
    prisma.formacionAcademica.findUnique.mockResolvedValue({ id: 5, funcionarioId: 10 });
    await expect(service.revisar(th, 5, { decision: 'RECHAZADO' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
