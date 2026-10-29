import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { SLUG_MESSAGE, SLUG_PATTERN } from '../../../shared/validation/slug';

export class CreateTagDTO {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'O slug é obrigatório.' })
  @MaxLength(160)
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  slug: string;
}
