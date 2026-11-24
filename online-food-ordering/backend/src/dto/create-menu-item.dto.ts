import { IsNotEmpty, IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuItemDto {
  @IsNotEmpty({ message: 'Name must not be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNotEmpty({ message: 'Restaurant ID must not be empty' })
  @IsNumber({}, { message: 'Restaurant ID must be a number' })
  restaurantId: number;
}
