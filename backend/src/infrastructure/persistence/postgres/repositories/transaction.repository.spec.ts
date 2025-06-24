import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TransactionRepositoryPg } from './transaction.repository';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
import { Transaction, TransactionStatus } from '../../../../domain/entities/transaction.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TransactionRepositoryPg (Integration)', () => {
  let repository: TransactionRepositoryPg;
  let typeOrmRepo: Repository<TransactionOrmEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_NAME || 'test_db',
          entities: [TransactionOrmEntity],
          synchronize: true, // Solo para testing
          logging: false,
        }),
        TypeOrmModule.forFeature([TransactionOrmEntity]),
      ],
      providers: [TransactionRepositoryPg],
    }).compile();

    repository = module.get<TransactionRepositoryPg>(TransactionRepositoryPg);
    typeOrmRepo = module.get<Repository<TransactionOrmEntity>>(getRepositoryToken(TransactionOrmEntity));
  });

  beforeEach(async () => {
    // Limpiar la tabla antes de cada prueba
    await typeOrmRepo.clear();
  });

  afterAll(async () => {
    // Limpiar después de todas las pruebas
    await typeOrmRepo.clear();
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      // Arrange
      const transactionData = {
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: 'ref-456',
        amountInCents: 100000,
        status: 'PENDING' as TransactionStatus,
        customerEmail: 'test@example.com',
      };

      // Act
      const transaction = await repository.create(transactionData);

      // Assert
      expect(transaction.id).toBeDefined();
      expect(transaction.productId).toBe('a3e1b2c4-1234-5678-9abc-def012345678');
      expect(transaction.reference).toBe('ref-456');
      expect(transaction.amountInCents).toBe(100000);
      expect(transaction.status).toBe('PENDING');
      expect(transaction.customerEmail).toBe('test@example.com');
      expect(transaction.createdAt).toBeDefined();

      // Verify in database
      const dbTransaction = await typeOrmRepo.findOneBy({ id: transaction.id });
      expect(dbTransaction).toBeDefined();
      expect(dbTransaction?.productId).toBe('a3e1b2c4-1234-5678-9abc-def012345678');
      expect(dbTransaction?.status).toBe('PENDING');
    });

    it('should create transaction with different statuses', async () => {
      // Arrange
      const transactionData = {
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: 'ref-789',
        amountInCents: 50000,
        status: 'APPROVED' as TransactionStatus,
        customerEmail: 'approved@example.com',
      };

      // Act
      const transaction = await repository.create(transactionData);

      // Assert
      expect(transaction.status).toBe('APPROVED');
      expect(transaction.amountInCents).toBe(50000);
    });

    it('should create transaction with declined status', async () => {
      // Arrange
      const transactionData = {
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: 'ref-declined',
        amountInCents: 75000,
        status: 'DECLINED' as TransactionStatus,
        customerEmail: 'declined@example.com',
      };

      // Act
      const transaction = await repository.create(transactionData);

      // Assert
      expect(transaction.status).toBe('DECLINED');
    });
  });

  describe('findById', () => {
    it('should find a transaction by id', async () => {
      // Arrange
      const transactionData = {
        id: 'b4f2c3d5-2345-6789-abcd-ef1234567890',
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: 'ref-456',
        amountInCents: 100000,
        status: 'PENDING' as TransactionStatus,
        customerEmail: 'test@example.com',
        createdAt: new Date(),
      };
      await typeOrmRepo.save(transactionData);

      // Act
      const transaction = await repository.findById('b4f2c3d5-2345-6789-abcd-ef1234567890');

      // Assert
      expect(transaction).toBeDefined();
      expect(transaction?.id).toBe('b4f2c3d5-2345-6789-abcd-ef1234567890');
      expect(transaction?.productId).toBe('a3e1b2c4-1234-5678-9abc-def012345678');
      expect(transaction?.reference).toBe('ref-456');
      expect(transaction?.status).toBe('PENDING');
    });

    it('should return null if transaction not found', async () => {
      // Act
      const transaction = await repository.findById('b4f2c3d5-2345-6789-abcd-ef1234567890');

      // Assert
      expect(transaction).toBeNull();
    });
  });

  describe('findByReference', () => {
    it('should find a transaction by reference', async () => {
      // Arrange
      const transactionData = {
        id: 'b4f2c3d5-2345-6789-abcd-ef1234567890',
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: 'unique-ref-123',
        amountInCents: 100000,
        status: 'PENDING' as TransactionStatus,
        customerEmail: 'test@example.com',
        createdAt: new Date(),
      };
      await typeOrmRepo.save(transactionData);

      // Act
      const transaction = await repository.findByReference('unique-ref-123');

      // Assert
      expect(transaction).toBeDefined();
      expect(transaction?.reference).toBe('unique-ref-123');
      expect(transaction?.id).toBe('b4f2c3d5-2345-6789-abcd-ef1234567890');
    });

    it('should return null if reference not found', async () => {
      // Act
      const transaction = await repository.findByReference('non-existent-ref');

      // Assert
      expect(transaction).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status successfully', async () => {
      // Arrange
      const transactionData = {
        id: 'b4f2c3d5-2345-6789-abcd-ef1234567890',
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: 'ref-456',
        amountInCents: 100000,
        status: 'PENDING' as TransactionStatus,
        customerEmail: 'test@example.com',
        createdAt: new Date(),
      };
      await typeOrmRepo.save(transactionData);

      // Act
      const updatedTransaction = await repository.updateStatus('b4f2c3d5-2345-6789-abcd-ef1234567890', 'APPROVED');

      // Assert
      expect(updatedTransaction.status).toBe('APPROVED');
      expect(updatedTransaction.id).toBe('b4f2c3d5-2345-6789-abcd-ef1234567890');

      // Verify in database
      const dbTransaction = await typeOrmRepo.findOneBy({ id: 'b4f2c3d5-2345-6789-abcd-ef1234567890' });
      expect(dbTransaction?.status).toBe('APPROVED');
    });

    it('should update status to DECLINED', async () => {
      // Arrange
      const transactionData = {
        id: 'b4f2c3d5-2345-6789-abcd-ef1234567890',
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: 'ref-789',
        amountInCents: 50000,
        status: 'PENDING' as TransactionStatus,
        customerEmail: 'test2@example.com',
        createdAt: new Date(),
      };
      await typeOrmRepo.save(transactionData);

      // Act
      const updatedTransaction = await repository.updateStatus('b4f2c3d5-2345-6789-abcd-ef1234567890', 'DECLINED');

      // Assert
      expect(updatedTransaction.status).toBe('DECLINED');
    });

    it('should throw error if transaction not found', async () => {
      // Act & Assert
      await expect(repository.updateStatus('a3e1b2c4-1234-5678-9abc-def012345678', 'APPROVED'))
        .rejects.toThrow('Transaction with ID "a3e1b2c4-1234-5678-9abc-def012345678" not found');
    });

    it('should handle status transitions', async () => {
      // Arrange
      const transactionData = {
        id: 'b4f2c3d5-2345-6789-abcd-ef1234567890',
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: 'ref-101',
        amountInCents: 75000,
        status: 'PENDING' as TransactionStatus,
        customerEmail: 'test3@example.com',
        createdAt: new Date(),
      };
      await typeOrmRepo.save(transactionData);

      // Act - Multiple status updates
      await repository.updateStatus('b4f2c3d5-2345-6789-abcd-ef1234567890', 'APPROVED');
      const approvedTransaction = await repository.findById('b4f2c3d5-2345-6789-abcd-ef1234567890');
      
      await repository.updateStatus('b4f2c3d5-2345-6789-abcd-ef1234567890', 'DECLINED');
      const declinedTransaction = await repository.findById('b4f2c3d5-2345-6789-abcd-ef1234567890');

      // Assert
      expect(approvedTransaction?.status).toBe('APPROVED');
      expect(declinedTransaction?.status).toBe('DECLINED');
    });
  });

  describe('edge cases', () => {
    it('should handle transaction with zero amount', async () => {
      // Arrange
      const transactionData = {
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: 'ref-free',
        amountInCents: 0,
        status: 'APPROVED' as TransactionStatus,
        customerEmail: 'free@example.com',
      };

      // Act
      const transaction = await repository.create(transactionData);

      // Assert
      expect(transaction.amountInCents).toBe(0);
    });

    it('should handle transaction with very large amount', async () => {
      // Arrange
      const transactionData = {
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: 'ref-expensive',
        amountInCents: 999999999,
        status: 'PENDING' as TransactionStatus,
        customerEmail: 'expensive@example.com',
      };

      // Act
      const transaction = await repository.create(transactionData);

      // Assert
      expect(transaction.amountInCents).toBe(999999999);
    });

    it('should handle transaction with special characters in email', async () => {
      // Arrange
      const transactionData = {
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: 'ref-special',
        amountInCents: 100000,
        status: 'PENDING' as TransactionStatus,
        customerEmail: 'test+special@example.com',
      };

      // Act
      const transaction = await repository.create(transactionData);

      // Assert
      expect(transaction.customerEmail).toBe('test+special@example.com');
    });

    it('should handle transaction with long reference', async () => {
      // Arrange
      const longReference = 'a'.repeat(100);
      const transactionData = {
        productId: 'a3e1b2c4-1234-5678-9abc-def012345678',
        reference: longReference,
        amountInCents: 100000,
        status: 'PENDING' as TransactionStatus,
        customerEmail: 'longref@example.com',
      };

      // Act
      const transaction = await repository.create(transactionData);

      // Assert
      expect(transaction.reference).toBe(longReference);
    });
  });
}); 