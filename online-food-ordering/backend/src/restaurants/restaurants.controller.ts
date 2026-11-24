import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from '../dto/create-restaurant.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  async getAll() {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createDto);
  }
}
