import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'products' })
export class ProductOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
  
  @Column('text')
  description: string;

  @Column()
  price: number;

  @Column()
  stock: number;
  
  @Column()
  imageUrl: string;
}