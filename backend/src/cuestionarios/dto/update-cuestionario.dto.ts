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

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  texto?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  opciones?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  correcta?: number;

  @IsOptional()
  @IsString()
  explicacion?: string;
}

export class UpdateCuestionarioDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  materiaId?: string;

  @IsOptional()
  @IsEnum(Formato)
  formato?: Formato;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  preguntas?: UpdateQuestionDto[];
}
