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
import { Formato } from '@prisma/client';

export class QuestionMateriaDto {
  @IsString()
  materiaId!: string;

  @IsInt()
  @Min(0)
  unidad!: number;
}

export class CreateQuestionDto {
  @IsString()
  question!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  options!: string[];

  @IsInt()
  @Min(0)
  correct!: number;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsEnum(Formato)
  formato!: Formato;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuestionMateriaDto)
  materias!: QuestionMateriaDto[];
}
