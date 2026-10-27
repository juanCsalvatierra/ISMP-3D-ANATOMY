import {
  IsString,
  IsArray,
  IsInt,
  IsEnum,
  IsOptional,
  Min,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPregunta, Formato } from '@prisma/client';
import { QuestionMateriaDto } from './create-question.dto';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  options?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  correct?: number;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsEnum(Formato)
  formato?: Formato;

  @IsOptional()
  @IsString()
  tema?: string;

  // Aprobar / pasar a borrador, en las materias del usuario (un docente solo en
  // las de sus carreras; el ADMIN en todas — ver QuestionsService.revisar).
  // Se envía solo, sin otros campos.
  @IsOptional()
  @IsEnum(EstadoPregunta)
  estado?: EstadoPregunta;

  // Opcional junto con `estado`: limitar el cambio a una sola materia.
  @IsOptional()
  @IsString()
  materiaId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuestionMateriaDto)
  materias?: QuestionMateriaDto[];
}
