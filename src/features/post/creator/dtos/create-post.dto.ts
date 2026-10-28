import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { POST_STATUS } from '../../../../shared/enums/post-status.enum';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  content: string;

  @IsEnum(POST_STATUS)
  @IsOptional()
  status?: POST_STATUS;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];
}
