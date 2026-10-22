import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Rol } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RevisionDto } from '../common/dto/revision.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { CapacitacionesService } from './capacitaciones.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';

@ApiTags('capacitaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('capacitaciones')
export class CapacitacionesController {
  constructor(private readonly service: CapacitacionesService) {}

  @Post()
  crear(@CurrentUser() user: UsuarioAutenticado, @Body() dto: CreateCapacitacionDto) {
    return this.service.crear(user, dto);
  }

  @Get('mias')
  listarMias(@CurrentUser() user: UsuarioAutenticado) {
    return this.service.listarMias(user);
  }

  @Get('pendientes')
  @Roles(Rol.TALENTO_HUMANO, Rol.ADMIN)
  listarPendientes() {
    return this.service.listarPendientes();
  }

  @Get(':id')
  obtener(@CurrentUser() user: UsuarioAutenticado, @Param('id', ParseIntPipe) id: number) {
    return this.service.obtener(user, id);
  }

  @Patch(':id')
  actualizar(
    @CurrentUser() user: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCapacitacionDto,
  ) {
    return this.service.actualizar(user, id, dto);
  }

  @Delete(':id')
  eliminar(@CurrentUser() user: UsuarioAutenticado, @Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(user, id);
  }

  @Patch(':id/revision')
  @Roles(Rol.TALENTO_HUMANO, Rol.ADMIN)
  revisar(
    @CurrentUser() user: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RevisionDto,
  ) {
    return this.service.revisar(user, id, dto);
  }
}
