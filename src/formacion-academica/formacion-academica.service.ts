import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoValidacion, OrigenRegistro } from '@prisma/client';
import { RevisionDto } from '../common/dto/revision.dto';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { validarNoFutura } from '../common/utils/fechas';
import { esRevisor } from '../common/utils/roles';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormacionDto } from './dto/create-formacion.dto';
import { UpdateFormacionDto } from './dto/update-formacion.dto';

@Injectable()
export class FormacionAcademicaService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(user: UsuarioAutenticado, dto: CreateFormacionDto) {
    const fecha = new Date(dto.fechaObtencion);
    validarNoFutura(fecha, 'La fecha de obtención');

    return this.prisma.formacionAcademica.create({
      data: {
        ...dto,
        fechaObtencion: fecha,
        funcionarioId: user.funcionarioId,
        origen: OrigenRegistro.MANUAL,
      },
    });
  }

  listarMias(user: UsuarioAutenticado) {
    return this.prisma.formacionAcademica.findMany({
      where: { funcionarioId: user.funcionarioId },
      orderBy: { fechaObtencion: 'desc' },
    });
  }

  async obtener(user: UsuarioAutenticado, id: number) {
    const f = await this.prisma.formacionAcademica.findUnique({ where: { id } });
    if (!f) throw new NotFoundException('Formación académica no encontrada');
    if (f.funcionarioId !== user.funcionarioId && !esRevisor(user)) {
      throw new ForbiddenException('No tiene acceso a este registro');
    }
    return f;
  }

  async actualizar(user: UsuarioAutenticado, id: number, dto: UpdateFormacionDto) {
    const actual = await this.obtenerPropia(user, id);
    if (actual.estado === EstadoValidacion.VALIDADO) {
      throw new ForbiddenException('Un registro validado no puede modificarse');
    }
    const fecha = dto.fechaObtencion ? new Date(dto.fechaObtencion) : actual.fechaObtencion;
    validarNoFutura(fecha, 'La fecha de obtención');

    return this.prisma.formacionAcademica.update({
      where: { id },
      data: {
        ...dto,
        fechaObtencion: fecha,
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
    await this.prisma.formacionAcademica.delete({ where: { id } });
    return { eliminado: true };
  }

  async revisar(user: UsuarioAutenticado, id: number, dto: RevisionDto) {
    const f = await this.prisma.formacionAcademica.findUnique({ where: { id } });
    if (!f) throw new NotFoundException('Formación académica no encontrada');
    if (dto.decision === 'RECHAZADO' && !dto.observacion?.trim()) {
      throw new BadRequestException('El rechazo requiere una observación');
    }
    return this.prisma.formacionAcademica.update({
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
    const f = await this.prisma.formacionAcademica.findUnique({ where: { id } });
    if (!f) throw new NotFoundException('Formación académica no encontrada');
    if (f.funcionarioId !== user.funcionarioId) {
      throw new ForbiddenException('Solo el propietario puede modificar este registro');
    }
    return f;
  }
}
