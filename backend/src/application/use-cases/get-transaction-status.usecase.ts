import { Injectable, Inject } from '@nestjs/common';
import { IWompiGateway } from '../../domain/gateways/IWompi.gateway';
import { ITransactionRepository } from '../../domain/repositories/ITransaction.repository';

export interface GetTransactionStatusRequest {
  transactionId: string;
}

export interface GetTransactionStatusResponse {
  id: string;
  status: string;
  amount_in_cents: number;
  reference: string;
  customer_email?: string;
  created_at?: string;
  finalized_at?: string;
}

export interface WompiTransactionStatusExtended {
  id: string;
  status: string;
  amount_in_cents: number;
  reference: string;
  customer_email?: string;
  created_at?: string;
  finalized_at?: string;
}

export class GetTransactionStatusResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: GetTransactionStatusResponse,
    public readonly error?: Error,
  ) {}

  static success(
    value: GetTransactionStatusResponse,
  ): GetTransactionStatusResult {
    return new GetTransactionStatusResult(true, value);
  }

  static failure(error: Error): GetTransactionStatusResult {
    return new GetTransactionStatusResult(false, undefined, error);
  }
}

@Injectable()
export class GetTransactionStatusUseCase {
  constructor(
    @Inject(IWompiGateway) private readonly wompiGateway: IWompiGateway,
    @Inject(ITransactionRepository)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    request: GetTransactionStatusRequest,
  ): Promise<GetTransactionStatusResult> {
    try {
      // Obtener el estado de la transacción desde Wompi
      const wompiStatus = await this.wompiGateway.getTransactionStatus(
        request.transactionId,
      );

      // Intentar encontrar la transacción en nuestra base de datos por referencia
      await this.transactionRepository.findByReference(wompiStatus.reference);

      const extendedStatus = wompiStatus as WompiTransactionStatusExtended;

      const response: GetTransactionStatusResponse = {
        id: wompiStatus.id,
        status: wompiStatus.status,
        amount_in_cents: wompiStatus.amount_in_cents,
        reference: wompiStatus.reference,
        // Agregar campos adicionales si están disponibles
        ...(extendedStatus.customer_email && {
          customer_email: extendedStatus.customer_email,
        }),
        ...(extendedStatus.created_at && {
          created_at: extendedStatus.created_at,
        }),
        ...(extendedStatus.finalized_at && {
          finalized_at: extendedStatus.finalized_at,
        }),
      };

      return GetTransactionStatusResult.success(response);
    } catch (error) {
      return GetTransactionStatusResult.failure(error as Error);
    }
  }
}
