import { Body, Controller, Get, Param, ParseEnumPipe, Put, UseGuards, Header } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Rol, TipoFuncionario } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { ConfiguracionPerfilDto } from './perfil.dto';
import { PerfilesService } from './perfiles.service';

@ApiTags('parametrizacion') @ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PerfilesController {
  constructor(private readonly service: PerfilesService) {}

  @Get('hoja-vida/parametrizacion')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Secciones del funcionario autenticado' })
  miConfiguracion(@CurrentUser() user: UsuarioAutenticado) {
    return this.service.paraFuncionario(user.funcionarioId);
  }

  @Get('perfiles/:tipo') @Roles(Rol.ADMIN, Rol.TALENTO_HUMANO)
  @Header('Cache-Control', 'no-store')
  obtener(@Param('tipo', new ParseEnumPipe(TipoFuncionario)) tipo: TipoFuncionario) {
    return this.service.obtener(tipo);
  }

  @Put('perfiles/:tipo') @Roles(Rol.ADMIN, Rol.TALENTO_HUMANO)
  actualizar(@Param('tipo', new ParseEnumPipe(TipoFuncionario)) tipo: TipoFuncionario, @Body() dto: ConfiguracionPerfilDto) {
    return this.service.actualizar(tipo, dto);
  }
}
