import { IsString, IsInt, Min } from 'class-validator';

export class StartAttemptDto {
  @IsString()
  materiaId!: string;

  @IsInt()
  @Min(0)
  unidad!: number;

  @IsInt()
  @Min(1)
  cantidad!: number;
}
