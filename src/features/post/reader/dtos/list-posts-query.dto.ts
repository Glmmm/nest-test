import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SLUG_MESSAGE, SLUG_PATTERN } from '../../../../shared/validation/slug';

export class ListPostsQueryDTO {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit: number = 10;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  search?: string;

  @IsString()
  @IsOptional()
  @Matches(SLUG_PATTERN, { message: `Categoria: ${SLUG_MESSAGE}` })
  category?: string;

  @IsString()
  @IsOptional()
  @Matches(SLUG_PATTERN, { message: `Tag: ${SLUG_MESSAGE}` })
  tag?: string;
}
