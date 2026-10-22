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
import { CreateFormacionDto } from './dto/create-formacion.dto';
import { UpdateFormacionDto } from './dto/update-formacion.dto';
import { FormacionAcademicaService } from './formacion-academica.service';

@ApiTags('formacion-academica')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('formacion-academica')
export class FormacionAcademicaController {
  constructor(private readonly service: FormacionAcademicaService) {}

  @Post()
  crear(@CurrentUser() user: UsuarioAutenticado, @Body() dto: CreateFormacionDto) {
    return this.service.crear(user, dto);
  }

  @Get('mias')
  listarMias(@CurrentUser() user: UsuarioAutenticado) {
    return this.service.listarMias(user);
  }

  @Get(':id')
  obtener(@CurrentUser() user: UsuarioAutenticado, @Param('id', ParseIntPipe) id: number) {
    return this.service.obtener(user, id);
  }

  @Patch(':id')
  actualizar(
    @CurrentUser() user: UsuarioAutenticado,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFormacionDto,
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
