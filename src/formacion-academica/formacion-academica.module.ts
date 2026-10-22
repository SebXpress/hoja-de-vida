import { Module } from '@nestjs/common';
import { FormacionAcademicaController } from './formacion-academica.controller';
import { FormacionAcademicaService } from './formacion-academica.service';

@Module({
  controllers: [FormacionAcademicaController],
  providers: [FormacionAcademicaService],
})
export class FormacionAcademicaModule {}
