import { Module } from '@nestjs/common';
import { HojaDeVidaController } from './hoja-de-vida.controller';
import { HojaDeVidaService } from './hoja-de-vida.service';

@Module({
  controllers: [HojaDeVidaController],
  providers: [HojaDeVidaService],
})
export class HojaDeVidaModule {}
