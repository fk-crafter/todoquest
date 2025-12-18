import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { Difficulty } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;
}
