import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from '../entities/menu-item.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { ApiKeyGuard } from '../common/api-key.guard';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem, Restaurant])],
  controllers: [MenuItemsController],
  providers: [MenuItemsService, ApiKeyGuard],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
