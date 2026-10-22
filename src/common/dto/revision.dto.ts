import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class RevisionDto {
  @IsIn(['VALIDADO', 'RECHAZADO'])
  decision: 'VALIDADO' | 'RECHAZADO';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacion?: string;
}
