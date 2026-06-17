import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Formato } from '@prisma/client';

// ─── DTO de una pregunta individual ──────────────────────────────────────────

export class CreateQuestionDto {
  @IsString()
  texto!: string;

  @IsArray()
  @IsString({ each: true })
  opciones!: string[];

  @IsInt()
  @Min(0)
  correcta!: number;

  @IsOptional()
  @IsString()
  explicacion?: string;
}

// ─── DTO del cuestionario completo ───────────────────────────────────────────

export class CreateCuestionarioDto {
  @IsString()
  titulo!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  materiaId!: string;

  @IsEnum(Formato)
  formato!: Formato;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  preguntas!: CreateQuestionDto[];
}
