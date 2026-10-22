import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CapacitacionesService } from './capacitaciones.service';

describe('CapacitacionesService', () => {
  const prisma: any = {
    capacitacion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const funcionario: any = { id: 1, email: 'f@u.ec', rol: 'FUNCIONARIO', funcionarioId: 10 };
  const otro: any = { id: 2, email: 'o@u.ec', rol: 'FUNCIONARIO', funcionarioId: 20 };
  const th: any = { id: 3, email: 'th@u.ec', rol: 'TALENTO_HUMANO', funcionarioId: 30 };
  let service: CapacitacionesService;

  const dtoValido = {
    nombre: 'Docencia universitaria',
    institucion: 'ESPE',
    fechaInicio: '2025-01-10',
    fechaFin: '2025-02-10',
    horas: 40,
    evidenciaUrl: 'https://ejemplo.com/diploma.pdf',
  };
  const existente = (estado = 'PENDIENTE') => ({
    id: 7,
    funcionarioId: 10,
    estado,
    fechaInicio: new Date('2025-01-10'),
    fechaFin: new Date('2025-02-10'),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CapacitacionesService(prisma);
  });

  describe('crear', () => {
    it('asocia la capacitación al funcionario autenticado', async () => {
      prisma.capacitacion.create.mockResolvedValue({ id: 1 });
      await service.crear(funcionario, dtoValido);
      expect(prisma.capacitacion.create.mock.calls[0][0].data.funcionarioId).toBe(10);
    });

    it('rechaza fecha fin anterior a fecha inicio', async () => {
      await expect(
        service.crear(funcionario, { ...dtoValido, fechaFin: '2024-12-31' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.capacitacion.create).not.toHaveBeenCalled();
    });

    it('rechaza fecha fin futura', async () => {
      const futura = new Date(Date.now() + 86400000 * 30).toISOString();
      const inicio = new Date(Date.now() - 86400000).toISOString();
      await expect(
        service.crear(funcionario, { ...dtoValido, fechaInicio: inicio, fechaFin: futura }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('obtener', () => {
    it('lanza NotFound si no existe', async () => {
      prisma.capacitacion.findUnique.mockResolvedValue(null);
      await expect(service.obtener(funcionario, 1)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('prohíbe ver registros de otro funcionario', async () => {
      prisma.capacitacion.findUnique.mockResolvedValue(existente());
      await expect(service.obtener(otro, 7)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('permite a Talento Humano ver cualquier registro', async () => {
      prisma.capacitacion.findUnique.mockResolvedValue(existente());
      await expect(service.obtener(th, 7)).resolves.toBeDefined();
    });
  });

  describe('actualizar', () => {
    it('prohíbe modificar a quien no es propietario', async () => {
      prisma.capacitacion.findUnique.mockResolvedValue(existente());
      await expect(service.actualizar(otro, 7, { horas: 10 })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('prohíbe modificar un registro validado', async () => {
      prisma.capacitacion.findUnique.mockResolvedValue(existente('VALIDADO'));
      await expect(service.actualizar(funcionario, 7, { horas: 10 })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('devuelve el registro rechazado a PENDIENTE al corregirlo', async () => {
      prisma.capacitacion.findUnique.mockResolvedValue(existente('RECHAZADO'));
      prisma.capacitacion.update.mockResolvedValue({});
      await service.actualizar(funcionario, 7, { horas: 20 });
      const data = prisma.capacitacion.update.mock.calls[0][0].data;
      expect(data.estado).toBe('PENDIENTE');
      expect(data.observacionRevision).toBeNull();
    });
  });

  describe('eliminar', () => {
    it('prohíbe eliminar un registro validado', async () => {
      prisma.capacitacion.findUnique.mockResolvedValue(existente('VALIDADO'));
      await expect(service.eliminar(funcionario, 7)).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.capacitacion.delete).not.toHaveBeenCalled();
    });

    it('elimina un registro pendiente propio', async () => {
      prisma.capacitacion.findUnique.mockResolvedValue(existente());
      await expect(service.eliminar(funcionario, 7)).resolves.toEqual({ eliminado: true });
    });
  });

  describe('revisar', () => {
    it('exige observación al rechazar', async () => {
      prisma.capacitacion.findUnique.mockResolvedValue(existente());
      await expect(
        service.revisar(th, 7, { decision: 'RECHAZADO' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('valida un registro y registra al revisor', async () => {
      prisma.capacitacion.findUnique.mockResolvedValue(existente());
      prisma.capacitacion.update.mockResolvedValue({});
      await service.revisar(th, 7, { decision: 'VALIDADO' });
      const data = prisma.capacitacion.update.mock.calls[0][0].data;
      expect(data.estado).toBe('VALIDADO');
      expect(data.revisadoPorId).toBe(3);
      expect(data.revisadoEn).toBeInstanceOf(Date);
    });
  });
});
