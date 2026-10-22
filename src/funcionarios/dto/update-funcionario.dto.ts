import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateFuncionarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombres?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidos?: string;

  @IsOptional()
  @Matches(/^\+?\d{7,15}$/, { message: 'Teléfono inválido' })
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  departamento?: string;
}
