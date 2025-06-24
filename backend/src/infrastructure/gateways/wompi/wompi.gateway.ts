import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { IWompiGateway, WompiPaymentData, WompiPaymentResponse } from '../../../domain/gateways/IWompi.gateway';

// Interfaces para las nuevas funcionalidades
export interface WompiTransactionStatus {
  id: string;
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';
  reference: string;
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    extra: any;
  };
  status_message?: string;
  created_at: string;
  finalized_at?: string;
  shipping_address?: any;
  payment_link_id?: string;
  payment_source_id?: number;
}

export interface WompiWebhookEvent {
  event: string;
  data: {
    transaction: WompiTransactionStatus;
  };
  sent_at: string;
  timestamp: number;
  signature: {
    properties: string[];
    checksum: string;
  };
}

export interface WompiTestCards {
  approved: string;
  declined: string;
  pending: string;
  insufficient: string;
  fraud: string;
}

@Injectable()
export class WompiGateway implements IWompiGateway {
  private readonly logger = new Logger(WompiGateway.name);
  private readonly WOMPI_API_BASE_URL: string;
  private readonly WOMPI_PRIVATE_KEY: string;
  private readonly WOMPI_PUBLIC_KEY: string;
  private readonly WOMPI_INTEGRITY_KEY: string;
  private readonly WOMPI_EVENTS_SECRET: string;
  private acceptanceToken: string = '';

  // Tarjetas de prueba para diferentes escenarios
  public readonly TEST_CARDS: WompiTestCards = {
    approved: '4242424242424242',
    declined: '4000000000000002',
    pending: '4000000000000069',
    insufficient: '4000000000000119',
    fraud: '4100000000000019'
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.WOMPI_API_BASE_URL = this.configService.get<string>('WOMPI_API_BASE_URL') ?? '';
    this.WOMPI_PRIVATE_KEY = this.configService.get<string>('WOMPI_PRIVATE_KEY') ?? '';
    this.WOMPI_PUBLIC_KEY = this.configService.get<string>('WOMPI_PUBLIC_KEY') ?? '';
    this.WOMPI_INTEGRITY_KEY = this.configService.get<string>('WOMPI_INTEGRITY_KEY') ?? '';
    this.WOMPI_EVENTS_SECRET = this.configService.get<string>('WOMPI_EVENTS_SECRET') ?? '';

    this.logger.log('Wompi Config Loaded for Gateway:', {
      apiBaseUrl: this.WOMPI_API_BASE_URL,
      hasPrivateKey: !!this.WOMPI_PRIVATE_KEY,
      hasPublicKey: !!this.WOMPI_PUBLIC_KEY,
      hasIntegrityKey: !!this.WOMPI_INTEGRITY_KEY,
      hasEventsSecret: !!this.WOMPI_EVENTS_SECRET,
    });
  }

  /**
   * Obtiene el acceptance token dinámicamente desde la API de Wompi
   */
  private async getAcceptanceToken(): Promise<string> {
    if (this.acceptanceToken) {
      return this.acceptanceToken;
    }

    try {
      const url = `${this.WOMPI_API_BASE_URL}/merchants/${this.WOMPI_PUBLIC_KEY}`;
      const response = await firstValueFrom(
        this.httpService.get(url)
      );

      const presignedAcceptance = response.data.data.presigned_acceptance;
      if (!presignedAcceptance || !presignedAcceptance.acceptance_token) {
        throw new Error('No se pudo obtener el acceptance token de Wompi');
      }

      this.acceptanceToken = presignedAcceptance.acceptance_token;
      this.logger.log('Acceptance token obtenido exitosamente');
      return this.acceptanceToken;
    } catch (error) {
      this.logger.error('Error obteniendo acceptance token:', error.response?.data || error.message);
      throw new Error('No se pudo obtener el acceptance token de Wompi');
    }
  }

  private generateIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const message = `${reference}${amountInCents}${currency}${this.WOMPI_INTEGRITY_KEY}`;
    const hash = crypto.createHash('sha256').update(message, 'utf8').digest('hex');
    
    this.logger.log(`Signature: Generated for ref ${reference} -> hash: ${hash}`);
    this.logger.debug(`Signature message: "${message}"`);
    
    return hash;
  }

  async createPayment(data: WompiPaymentData): Promise<WompiPaymentResponse> {
    const url = `${this.WOMPI_API_BASE_URL}/transactions`;
    
    const acceptanceToken = await this.getAcceptanceToken();
    
    const headers = { 
      Authorization: `Bearer ${this.WOMPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    };

    const signature = this.generateIntegritySignature(
      data.reference,
      data.amountInCents,
      data.currency,
    );

    const wompiPayload = {
      acceptance_token: acceptanceToken,
      amount_in_cents: data.amountInCents,
      currency: data.currency,
      customer_email: data.customerEmail,
      payment_method: {
        type: data.paymentMethod.type,
        token: data.paymentMethod.token,
        installments: data.paymentMethod.installments,
      },
      reference: data.reference,
      signature: signature,
    };

    this.logger.log('Calling Wompi (/transactions) with payload:', {
      ...wompiPayload,
      signature: signature.substring(0, 10) + '...',
    });

    try {
      const wompiResponse = await firstValueFrom(
        this.httpService.post<{ data: WompiPaymentResponse }>(url, wompiPayload, { headers }),
      );
      
      this.logger.log('Wompi API call successful:', {
        id: wompiResponse.data.data.id,
        status: wompiResponse.data.data.status,
        reference: wompiResponse.data.data.reference,
      });
      
      return wompiResponse.data.data;
    } catch (error) {
      this.logger.error('Error from Wompi API (/transactions):', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      
      const errorMessage = error.response?.data?.error?.messages 
        ? JSON.stringify(error.response.data.error.messages)
        : error.message;
      
      throw new Error(`Error en Wompi API: ${errorMessage}`);
    }
  }

  /**
   * Consulta el estado actual de una transacción
   */
  async getTransactionStatus(transactionId: string): Promise<WompiTransactionStatus> {
    const url = `${this.WOMPI_API_BASE_URL}/transactions/${transactionId}`;
    const headers = { 
      Authorization: `Bearer ${this.WOMPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get<{ data: WompiTransactionStatus }>(url, { headers })
      );

      this.logger.log(`Transaction status retrieved for ${transactionId}:`, {
        id: response.data.data.id,
        status: response.data.data.status,
        reference: response.data.data.reference,
      });

      return response.data.data;
    } catch (error) {
      this.logger.error(`Error retrieving transaction status for ${transactionId}:`, error.response?.data);
      throw new Error(`No se pudo obtener el estado de la transacción: ${transactionId}`);
    }
  }

  /**
   * Valida la firma de un webhook de Wompi
   */
  validateWebhookSignature(
    payload: string,
    signature: string,
    timestamp: string
  ): boolean {
    try {
      // Wompi usa el siguiente formato para generar la firma:
      // timestamp.payload con el secret
      const message = `${timestamp}.${payload}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.WOMPI_EVENTS_SECRET)
        .update(message, 'utf8')
        .digest('hex');

      // Comparar de forma segura
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

      this.logger.debug(`Webhook signature validation: ${isValid ? 'VALID' : 'INVALID'}`);
      return isValid;
    } catch (error) {
      this.logger.error('Error validating webhook signature:', error);
      return false;
    }
  }

  /**
   * Procesa un evento de webhook de Wompi
   */
  async processWebhookEvent(
    payload: string,
    signature: string,
    timestamp: string
  ): Promise<WompiWebhookEvent> {
    // Validar la firma primero
    if (!this.validateWebhookSignature(payload, signature, timestamp)) {
      throw new Error('Invalid webhook signature');
    }

    try {
      const event: WompiWebhookEvent = JSON.parse(payload);
      
      this.logger.log('Processing webhook event:', {
        event: event.event,
        transactionId: event.data.transaction.id,
        status: event.data.transaction.status,
        reference: event.data.transaction.reference,
      });

      // Aquí puedes agregar lógica específica según el tipo de evento
      switch (event.event) {
        case 'transaction.updated':
          await this.handleTransactionUpdated(event.data.transaction);
          break;
        case 'transaction.created':
          await this.handleTransactionCreated(event.data.transaction);
          break;
        default:
          this.logger.warn(`Unhandled webhook event: ${event.event}`);
      }

      return event;
    } catch (error) {
      this.logger.error('Error processing webhook event:', error);
      throw new Error('Failed to process webhook event');
    }
  }

  /**
   * Maneja el evento de transacción actualizada
   */
  private async handleTransactionUpdated(transaction: WompiTransactionStatus): Promise<void> {
    this.logger.log(`Transaction updated: ${transaction.id} -> ${transaction.status}`);
    
    // Aquí puedes agregar tu lógica de negocio
    // Por ejemplo: actualizar la base de datos, enviar notificaciones, etc.
    
    switch (transaction.status) {
      case 'APPROVED':
        this.logger.log(`Payment approved for reference: ${transaction.reference}`);
        // Lógica para pago aprobado
        break;
      case 'DECLINED':
        this.logger.log(`Payment declined for reference: ${transaction.reference}`);
        // Lógica para pago rechazado
        break;
      case 'PENDING':
        this.logger.log(`Payment pending for reference: ${transaction.reference}`);
        // Lógica para pago pendiente
        break;
      case 'ERROR':
        this.logger.error(`Payment error for reference: ${transaction.reference}`);
        // Lógica para error en pago
        break;
    }
  }

  /**
   * Maneja el evento de transacción creada
   */
  private async handleTransactionCreated(transaction: WompiTransactionStatus): Promise<void> {
    this.logger.log(`Transaction created: ${transaction.id} with status ${transaction.status}`);
    // Lógica para nueva transacción
  }

  /**
   * Genera un token de tarjeta de prueba para testing
   */
  async generateTestCardToken(cardNumber: string, testScenario?: keyof WompiTestCards): Promise<string> {
    const url = `${this.WOMPI_API_BASE_URL}/tokens/cards`;
    const headers = { 
      Authorization: `Bearer ${this.WOMPI_PUBLIC_KEY}`,
      'Content-Type': 'application/json'
    };

    const finalCardNumber = testScenario ? this.TEST_CARDS[testScenario] : cardNumber;

    const payload = {
      number: finalCardNumber,
      cvc: '123',
      exp_month: '12',
      exp_year: '2025',
      card_holder: 'Test User'
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ data: { id: string } }>(url, payload, { headers })
      );

      this.logger.log(`Test card token generated for scenario: ${testScenario || 'custom'}`, {
        tokenId: response.data.data.id,
        cardNumber: finalCardNumber.replace(/\d(?=\d{4})/g, '*'),
      });

      return response.data.data.id;
    } catch (error) {
      this.logger.error('Error generating test card token:', error.response?.data);
      throw new Error('Failed to generate test card token');
    }
  }

  /**
   * Método para limpiar el cache del acceptance token si es necesario
   */
  clearAcceptanceTokenCache(): void {
    this.acceptanceToken = '';
    this.logger.log('Acceptance token cache cleared');
  }

  /**
   * Obtiene información de testing y tarjetas disponibles
   */
  getTestingInfo(): {
    testCards: WompiTestCards;
    expectedOutcomes: Record<keyof WompiTestCards, string>;
  } {
    return {
      testCards: this.TEST_CARDS,
      expectedOutcomes: {
        approved: 'APPROVED - Pago aprobado exitosamente',
        declined: 'DECLINED - Pago rechazado',
        pending: 'PENDING - Pago pendiente de confirmación',
        insufficient: 'DECLINED - Fondos insuficientes',
        fraud: 'DECLINED - Transacción fraudulenta'
      }
    };
  }
}