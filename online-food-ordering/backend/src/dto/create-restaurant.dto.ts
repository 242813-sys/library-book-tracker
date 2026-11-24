import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRestaurantDto {
  @IsNotEmpty({ message: 'Restaurant name must not be empty.' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Restaurant address must not be empty.' })
  @IsString()
  address: string;
}
