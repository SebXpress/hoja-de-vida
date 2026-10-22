import { NivelFormacion } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateFormacionDto {
  @IsEnum(NivelFormacion)
  nivel: NivelFormacion;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  institucion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  pais: string;

  @IsDateString()
  fechaObtencion: string;

  @IsOptional()
  @Matches(/^[A-Za-z0-9-]{3,30}$/, { message: 'Número de registro inválido' })
  numeroRegistroSenescyt?: string;

  @IsOptional()
  @IsUrl()
  evidenciaUrl?: string;
}
