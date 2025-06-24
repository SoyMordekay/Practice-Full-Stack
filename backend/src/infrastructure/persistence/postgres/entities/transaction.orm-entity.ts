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

  @Column({ type: 'varchar', nullable: true }) // O el tipo que Wompi use para sus IDs
  wompiTransactionId?: string;

  @Column({ type: 'jsonb', nullable: true }) // 'jsonb' es bueno para PostgreSQL
  wompiResponse?: any; // Guarda el objeto de respuesta completo de Wompi
}
