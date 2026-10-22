import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Injectable()
export class FuncionariosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtener(funcionarioId: number) {
    const f = await this.prisma.funcionario.findUnique({ where: { id: funcionarioId } });
    if (!f) throw new NotFoundException('Funcionario no encontrado');
    return f;
  }

  async actualizar(funcionarioId: number, dto: UpdateFuncionarioDto) {
    await this.obtener(funcionarioId);
    // La cédula y el tipo de funcionario no son editables por el propio usuario.
    return this.prisma.funcionario.update({ where: { id: funcionarioId }, data: dto });
  }
}
