import { TipoFuncionario } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'La contraseña debe contener letras y números',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidos: string;

  @Matches(/^\d{10}$/, { message: 'La cédula debe tener 10 dígitos' })
  cedula: string;

  @IsEnum(TipoFuncionario)
  tipoFuncionario: TipoFuncionario;
}
