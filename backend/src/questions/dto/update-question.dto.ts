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
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuestionMateriaDto)
  materias?: QuestionMateriaDto[];
}
