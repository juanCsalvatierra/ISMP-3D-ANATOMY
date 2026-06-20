import { IsString, IsInt, Min } from 'class-validator';

export class AnswerAttemptDto {
  @IsString()
  questionId!: string;

  @IsInt()
  @Min(0)
  selected!: number;
}
