import { Transaction, CreateTransactionData, TransactionStatus } from '../entities/transaction.entity';

export const ITransactionRepository = Symbol('ITransactionRepository');

export interface ITransactionRepository {
  /**
   * Crea una nueva transacción en la base de datos.
   * @param transactionData Los datos necesarios para crear la transacción.
   * @returns La entidad de transacción completa, incluyendo el ID y createdAt generados.
   */
  create(transactionData: CreateTransactionData): Promise<Transaction>;

  /**
   * Encuentra una transacción por su ID.
   * @param id El ID de la transacción.
   * @returns La transacción o null si no se encuentra.
   */
  findById(id: string): Promise<Transaction | null>;

  /**
   * Actualiza el estado de una transacción.
   * @param id El ID de la transacción a actualizar.
   * @param status El nuevo estado de la transacción.
   * @returns La transacción actualizada.
   */
  updateStatus(id: string, status: TransactionStatus): Promise<Transaction>;

  findByReference(reference: string): Promise<Transaction | null>;
  
}