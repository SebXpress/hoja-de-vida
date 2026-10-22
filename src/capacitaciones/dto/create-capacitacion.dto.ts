import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCapacitacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  institucion: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsInt()
  @Min(1)
  @Max(5000)
  horas: number;

  /** Enlace al diploma/certificado. La carga de archivos queda para la iteración 2. */
  @IsUrl()
  evidenciaUrl: string;
}
