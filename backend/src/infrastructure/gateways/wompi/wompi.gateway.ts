import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IWompiGateway, WompiPaymentData, WompiPaymentResponse } from '../../../domain/gateways/IWompi.gateway';

@Injectable()
export class WompiGateway implements IWompiGateway {
  private readonly logger = new Logger(WompiGateway.name);
  private readonly wompiUrl: string;
  private readonly wompiPublicKey: string;
  private readonly wompiAcceptanceToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.wompiUrl = this.configService.get<string>('WOMPI_SANDBOX_URL')?? "";
    this.wompiPublicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY')?? "";
    this.wompiAcceptanceToken = this.configService.get<string>('WOMPI_ACCEPTANCE_TOKEN')?? "";
  }

  async createPayment(data: WompiPaymentData): Promise<WompiPaymentResponse> {
    const url = `${this.wompiUrl}/transactions`;
    const headers = { Authorization: `Bearer ${this.wompiPublicKey}` };

    const wompiPayload = {
      acceptance_token: this.wompiAcceptanceToken,
      amount_in_cents: data.amountInCents,
      currency: data.currency,
      customer_email: data.customerEmail,
      payment_method: {
        type: data.paymentMethod.type,
        token: data.paymentMethod.token,
        installments: data.paymentMethod.installments,
      },
      reference: data.reference,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, wompiPayload, { headers }),
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Error from Wompi API:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  }
}