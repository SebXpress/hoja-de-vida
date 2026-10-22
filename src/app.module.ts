import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CapacitacionesModule } from './capacitaciones/capacitaciones.module';
import { FormacionAcademicaModule } from './formacion-academica/formacion-academica.module';
import { FuncionariosModule } from './funcionarios/funcionarios.module';
import { HojaDeVidaModule } from './hoja-de-vida/hoja-de-vida.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FuncionariosModule,
    CapacitacionesModule,
    FormacionAcademicaModule,
    HojaDeVidaModule,
  ],
})
export class AppModule {}
