import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { ApiKeyGuard } from '../common/api-key.guard';

@Controller('menu-items')
@UseGuards(ApiKeyGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  // GET /menu-items - List all menu items
  @Get()
  async getAll() {
    return this.menuItemsService.findAll();
  }

  // GET /menu-items/:id - Retrieve single menu item
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.findOne(id);
  }

  // POST /menu-items - Create new menu item
  @Post()
  async create(@Body() createDto: CreateMenuItemDto) {
    return this.menuItemsService.create(createDto);
  }

  // PUT /menu-items/:id - Update existing menu item
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(id, updateDto);
  }

  // DELETE /menu-items/:id - Remove menu item
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.delete(id);
  }
}
