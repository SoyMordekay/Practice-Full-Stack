import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'transactions' })
export class TransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reference: string;

  @Column()
  amountInCents: number;

  @Column()
  status: string;

  @Column()
  productId: string;

  @Column()
  customerEmail: string;

  @CreateDateColumn()
  createdAt: Date;
}
