import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MenuItem } from './menu-item.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.restaurant, { cascade: true })
  menuItems: MenuItem[];
}
