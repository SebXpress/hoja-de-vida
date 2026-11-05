import { Type } from 'class-transformer';
import { IsBoolean, IsDefined, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReglaSeccionDto {
  @ApiProperty() @IsBoolean() visible: boolean;
  @ApiProperty() @IsBoolean() obligatorio: boolean;
}
export class SeccionesDto {
  @ApiProperty({ type: ReglaSeccionDto }) @IsDefined() @IsObject() @ValidateNested() @Type(() => ReglaSeccionDto)
  datos_personales: ReglaSeccionDto;
  @ApiProperty({ type: ReglaSeccionDto }) @IsDefined() @IsObject() @ValidateNested() @Type(() => ReglaSeccionDto)
  formacion_academica: ReglaSeccionDto;
  @ApiProperty({ type: ReglaSeccionDto }) @IsDefined() @IsObject() @ValidateNested() @Type(() => ReglaSeccionDto)
  capacitacion: ReglaSeccionDto;
}
export class ConfiguracionPerfilDto {
  @ApiProperty({ type: SeccionesDto }) @IsDefined() @IsObject() @ValidateNested() @Type(() => SeccionesDto)
  secciones: SeccionesDto;
}
