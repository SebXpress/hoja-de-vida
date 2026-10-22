import { Module } from '@nestjs/common';
import { CapacitacionesController } from './capacitaciones.controller';
import { CapacitacionesService } from './capacitaciones.service';

@Module({
  controllers: [CapacitacionesController],
  providers: [CapacitacionesService],
})
export class CapacitacionesModule {}
