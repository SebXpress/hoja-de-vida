import { PartialType } from '@nestjs/swagger';
import { CreateFormacionDto } from './create-formacion.dto';

export class UpdateFormacionDto extends PartialType(CreateFormacionDto) {}
