import { IsOptional, IsNumber, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Price must be a positive number' })
  price?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
