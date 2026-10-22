import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Rol } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { HojaDeVidaService } from './hoja-de-vida.service';

@ApiTags('hoja-de-vida')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hoja-de-vida')
export class HojaDeVidaController {
  constructor(private readonly service: HojaDeVidaService) {}

  @Get('mi-hoja')
  @ApiQuery({ name: 'soloValidados', required: false, type: Boolean })
  miHoja(
    @CurrentUser() user: UsuarioAutenticado,
    @Query('soloValidados') soloValidados?: string,
  ) {
    return this.service.consolidar(user.funcionarioId, soloValidados === 'true');
  }

  @Get(':funcionarioId')
  @Roles(Rol.TALENTO_HUMANO, Rol.ADMIN)
  @ApiQuery({ name: 'soloValidados', required: false, type: Boolean })
  porFuncionario(
    @Param('funcionarioId', ParseIntPipe) funcionarioId: number,
    @Query('soloValidados') soloValidados?: string,
  ) {
    return this.service.consolidar(funcionarioId, soloValidados === 'true');
  }
}
