import { BadRequestException } from '@nestjs/common';

export function validarRangoFechas(inicio: Date, fin: Date): void {
  if (fin.getTime() < inicio.getTime()) {
    throw new BadRequestException(
      'La fecha de fin no puede ser anterior a la fecha de inicio',
    );
  }
}

export function validarNoFutura(fecha: Date, campo: string): void {
  if (fecha.getTime() > Date.now()) {
    throw new BadRequestException(`${campo} no puede ser una fecha futura`);
  }
}
