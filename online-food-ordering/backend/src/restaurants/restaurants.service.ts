import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateRestaurantDto } from '../dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async findAll(): Promise<Restaurant[]> {
    return this.restaurantRepo.find({
      relations: { menuItems: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      relations: { menuItems: true },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found.`);
    }
    return restaurant;
  }

  async create(dto: CreateRestaurantDto): Promise<Restaurant> {
    const restaurant = this.restaurantRepo.create(dto);
    return this.restaurantRepo.save(restaurant);
  }
}
