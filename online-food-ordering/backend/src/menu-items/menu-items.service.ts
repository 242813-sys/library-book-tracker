import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../entities/menu-item.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async findAll(): Promise<MenuItem[]> {
    return this.menuItemRepo.find({
      relations: { restaurant: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<MenuItem> {
    const item = await this.menuItemRepo.findOne({
      where: { id },
      relations: { restaurant: true },
    });
    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found.`);
    }
    return item;
  }

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: dto.restaurantId } });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${dto.restaurantId} not found.`);
    }

    const item = this.menuItemRepo.create({
      name: dto.name,
      price: dto.price,
      category: dto.category || 'General',
      description: dto.description || '',
      restaurant: restaurant,
      restaurantId: restaurant.id,
    });

    return this.menuItemRepo.save(item);
  }

  async update(id: number, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.findOne(id);

    if (dto.name !== undefined) item.name = dto.name;
    if (dto.price !== undefined) item.price = dto.price;
    if (dto.category !== undefined) item.category = dto.category;
    if (dto.description !== undefined) item.description = dto.description;

    return this.menuItemRepo.save(item);
  }

  async delete(id: number): Promise<{ message: string; deletedId: number }> {
    const item = await this.findOne(id);
    await this.menuItemRepo.remove(item);
    return { message: `Menu item '${item.name}' deleted successfully.`, deletedId: id };
  }
}
