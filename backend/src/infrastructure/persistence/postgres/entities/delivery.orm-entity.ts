import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('deliveries')
export class DeliveryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionId: string;

  @Column()
  customerId: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  trackingNumber?: string;

  @Column()
  estimatedDeliveryDate: Date;

  @Column({ nullable: true })
  actualDeliveryDate?: Date;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zipCode: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 