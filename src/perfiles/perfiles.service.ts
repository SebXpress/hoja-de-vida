import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Prisma, TipoFuncionario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConfiguracionPerfilDto, SeccionesDto } from './perfil.dto';

@Injectable()
export class PerfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async paraFuncionario(funcionarioId: number) {
    const funcionario = await this.prisma.funcionario.findUnique({ where: { id: funcionarioId }, select: { tipoFuncionario: true } });
    if (!funcionario) throw new NotFoundException('Funcionario no encontrado');
    return this.obtener(funcionario.tipoFuncionario);
  }

  async obtener(tipo: TipoFuncionario) {
    const config = await this.prisma.perfilConfiguracion.findUnique({ where: { tipoFuncionario: tipo } });
    if (!config) throw new ServiceUnavailableException('No existe configuración para este perfil. Contacta a Administración.');
    const reglas = plainToInstance(SeccionesDto, config.secciones);
    if (validateSync(reglas, { whitelist: true, forbidNonWhitelisted: true }).length ||
        Object.values(reglas).some(r => r.obligatorio && !r.visible)) {
      throw new ServiceUnavailableException('La configuración del perfil es inválida. Contacta a Administración.');
    }
    return { tipo_funcionario: tipo, secciones: reglas };
  }

  async actualizar(tipo: TipoFuncionario, dto: ConfiguracionPerfilDto) {
    if (Object.values(dto.secciones).some(r => r.obligatorio && !r.visible)) {
      throw new BadRequestException('Una sección obligatoria debe ser visible');
    }
    await this.obtener(tipo);
    await this.prisma.perfilConfiguracion.update({
      where: { tipoFuncionario: tipo },
      data: { secciones: JSON.parse(JSON.stringify(dto.secciones)) as Prisma.InputJsonValue },
    });
    return this.obtener(tipo);
  }
}
