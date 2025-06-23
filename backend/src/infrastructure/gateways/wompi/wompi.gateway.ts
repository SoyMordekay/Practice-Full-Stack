import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { IWompiGateway, WompiPaymentData, WompiPaymentResponse } from '../../../domain/gateways/IWompi.gateway';

@Injectable()
export class WompiGateway implements IWompiGateway {
  private readonly logger = new Logger(WompiGateway.name);
  private readonly WOMPI_API_BASE_URL: string;
  private readonly WOMPI_PRIVATE_KEY: string;
  private readonly WOMPI_PUBLIC_KEY: string;
  private readonly WOMPI_INTEGRITY_KEY: string;
  private acceptanceToken: string = '';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.WOMPI_API_BASE_URL = this.configService.get<string>('WOMPI_API_BASE_URL') ?? '';
    this.WOMPI_PRIVATE_KEY = this.configService.get<string>('WOMPI_PRIVATE_KEY') ?? '';
    this.WOMPI_PUBLIC_KEY = this.configService.get<string>('WOMPI_PUBLIC_KEY') ?? '';
    this.WOMPI_INTEGRITY_KEY = this.configService.get<string>('WOMPI_INTEGRITY_KEY') ?? '';

    this.logger.log('Wompi Config Loaded for Gateway:', {
      apiBaseUrl: this.WOMPI_API_BASE_URL,
      hasPrivateKey: !!this.WOMPI_PRIVATE_KEY,
      hasPublicKey: !!this.WOMPI_PUBLIC_KEY,
      hasIntegrityKey: !!this.WOMPI_INTEGRITY_KEY,
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
    // El orden correcto para la firma de integridad es:
    // reference + amount_in_cents + currency + integrity_key
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

  
  clearAcceptanceTokenCache(): void {
    this.acceptanceToken = '';
    this.logger.log('Acceptance token cache cleared');
  }
}