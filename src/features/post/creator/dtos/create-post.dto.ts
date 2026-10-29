import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { POST_STATUS } from '../../../../shared/enums/post-status.enum';
import { SLUG_MESSAGE, SLUG_PATTERN } from '../../../../shared/validation/slug';

export class CreatePostDTO {
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'O slug é obrigatório.' })
  @MaxLength(220)
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  slug: string;

  @IsString()
  @IsNotEmpty({ message: 'O conteúdo é obrigatório.' })
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  excerpt?: string;

  @IsEnum(POST_STATUS, { message: 'Status inválido.' })
  @IsOptional()
  status?: POST_STATUS;

  @IsUUID('4')
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];
}
