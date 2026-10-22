import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { FuncionariosService } from './funcionarios.service';

@ApiTags('funcionarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('funcionarios')
export class FuncionariosController {
  constructor(private readonly service: FuncionariosService) {}

  @Get('mi-perfil')
  miPerfil(@CurrentUser() user: UsuarioAutenticado) {
    return this.service.obtener(user.funcionarioId);
  }

  @Patch('mi-perfil')
  actualizar(@CurrentUser() user: UsuarioAutenticado, @Body() dto: UpdateFuncionarioDto) {
    return this.service.actualizar(user.funcionarioId, dto);
  }
}
