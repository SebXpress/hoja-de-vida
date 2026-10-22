import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoValidacion } from '@prisma/client';
import { RevisionDto } from '../common/dto/revision.dto';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { validarNoFutura, validarRangoFechas } from '../common/utils/fechas';
import { esRevisor } from '../common/utils/roles';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';

@Injectable()
export class CapacitacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(user: UsuarioAutenticado, dto: CreateCapacitacionDto) {
    const inicio = new Date(dto.fechaInicio);
    const fin = new Date(dto.fechaFin);
    validarRangoFechas(inicio, fin);
    validarNoFutura(fin, 'La fecha de fin');

    return this.prisma.capacitacion.create({
      data: {
        funcionarioId: user.funcionarioId,
        nombre: dto.nombre,
        institucion: dto.institucion,
        fechaInicio: inicio,
        fechaFin: fin,
        horas: dto.horas,
        evidenciaUrl: dto.evidenciaUrl,
      },
    });
  }

  listarMias(user: UsuarioAutenticado) {
    return this.prisma.capacitacion.findMany({
      where: { funcionarioId: user.funcionarioId },
      orderBy: { fechaFin: 'desc' },
    });
  }

  listarPendientes() {
    return this.prisma.capacitacion.findMany({
      where: { estado: EstadoValidacion.PENDIENTE },
      orderBy: { createdAt: 'asc' },
    });
  }

  async obtener(user: UsuarioAutenticado, id: number) {
    const cap = await this.prisma.capacitacion.findUnique({ where: { id } });
    if (!cap) throw new NotFoundException('Capacitación no encontrada');
    if (cap.funcionarioId !== user.funcionarioId && !esRevisor(user)) {
      throw new ForbiddenException('No tiene acceso a este registro');
    }
    return cap;
  }

  async actualizar(user: UsuarioAutenticado, id: number, dto: UpdateCapacitacionDto) {
    const actual = await this.obtenerPropia(user, id);
    if (actual.estado === EstadoValidacion.VALIDADO) {
      throw new ForbiddenException('Un registro validado no puede modificarse');
    }

    const inicio = dto.fechaInicio ? new Date(dto.fechaInicio) : actual.fechaInicio;
    const fin = dto.fechaFin ? new Date(dto.fechaFin) : actual.fechaFin;
    validarRangoFechas(inicio, fin);
    validarNoFutura(fin, 'La fecha de fin');

    const { fechaInicio: _fi, fechaFin: _ff, ...resto } = dto;
    return this.prisma.capacitacion.update({
      where: { id },
      data: {
        ...resto,
        fechaInicio: inicio,
        fechaFin: fin,
        // Toda modificación vuelve el registro a revisión.
        estado: EstadoValidacion.PENDIENTE,
        observacionRevision: null,
        revisadoEn: null,
        revisadoPorId: null,
      },
    });
  }

  async eliminar(user: UsuarioAutenticado, id: number) {
    const actual = await this.obtenerPropia(user, id);
    if (actual.estado === EstadoValidacion.VALIDADO) {
      throw new ForbiddenException('Un registro validado no puede eliminarse');
    }
    await this.prisma.capacitacion.delete({ where: { id } });
    return { eliminado: true };
  }

  async revisar(user: UsuarioAutenticado, id: number, dto: RevisionDto) {
    const cap = await this.prisma.capacitacion.findUnique({ where: { id } });
    if (!cap) throw new NotFoundException('Capacitación no encontrada');

    if (dto.decision === 'RECHAZADO' && !dto.observacion?.trim()) {
      throw new BadRequestException('El rechazo requiere una observación');
    }

    return this.prisma.capacitacion.update({
      where: { id },
      data: {
        estado: dto.decision as EstadoValidacion,
        observacionRevision: dto.observacion?.trim() ?? null,
        revisadoPorId: user.id,
        revisadoEn: new Date(),
      },
    });
  }

  private async obtenerPropia(user: UsuarioAutenticado, id: number) {
    const cap = await this.prisma.capacitacion.findUnique({ where: { id } });
    if (!cap) throw new NotFoundException('Capacitación no encontrada');
    if (cap.funcionarioId !== user.funcionarioId) {
      throw new ForbiddenException('Solo el propietario puede modificar este registro');
    }
    return cap;
  }
}
