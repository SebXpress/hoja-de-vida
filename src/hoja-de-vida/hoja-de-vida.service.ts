import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoValidacion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HojaDeVidaService {
  constructor(private readonly prisma: PrismaService) {}

  async consolidar(funcionarioId: number, soloValidados = false) {
    const filtro = soloValidados ? { estado: EstadoValidacion.VALIDADO } : undefined;

    const f = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
      include: {
        capacitaciones: { where: filtro, orderBy: { fechaFin: 'desc' } },
        formaciones: { where: filtro, orderBy: { fechaObtencion: 'desc' } },
      },
    });
    if (!f) throw new NotFoundException('Funcionario no encontrado');

    const { capacitaciones, formaciones, ...datosPersonales } = f;
    return {
      datosPersonales,
      formacionAcademica: formaciones,
      capacitaciones,
      resumen: {
        totalFormaciones: formaciones.length,
        totalCapacitaciones: capacitaciones.length,
        horasCapacitacion: capacitaciones.reduce((acc, c) => acc + c.horas, 0),
      },
    };
  }
}
