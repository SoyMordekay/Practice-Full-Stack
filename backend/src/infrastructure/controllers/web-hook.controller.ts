import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  RawBody, // Para obtener el cuerpo crudo para la validación de la firma
  Req, // Para acceder al objeto Request
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.usecase'; // Necesitaremos lógica de negocio
import { ITransactionRepository } from '../../domain/repositories/ITransaction.repository'; // Para actualizar la transacción
import { IProductRepository } from '../../domain/repositories/IProduct.repository'; // Para actualizar el stock
import { TransactionStatus } from '../../domain/entities/transaction.entity'; // Para los estados
import { Inject } from '@nestjs/common';


// Definimos la estructura esperada del payload del webhook de Wompi
interface WompiWebhookPayload {
  event: string; // ej. "transaction.updated"
  data: {
    transaction: {
      id: string; // ID de la transacción en Wompi
      status: TransactionStatus; // APPROVED, DECLINED, VOIDED, ERROR
      reference: string; // Nuestra referencia interna
      amount_in_cents: number;
      currency: string;
      // ... otros campos que puedan ser útiles
    };
  };
  signature?: { // La firma viene en el payload también, además del header
    checksum: string;
    properties: string[];
  };
  timestamp: number; // Timestamp del evento en Wompi
  sent_at: string; // Fecha de envío del evento
}

@Controller('webhooks/wompi') // Ruta base para los webhooks
export class WompiWebhookController {
  private readonly logger = new Logger(WompiWebhookController.name);
  private readonly WOMPI_EVENTS_SECRET: string;

  constructor(
    private readonly configService: ConfigService,
    // Inyectamos los repositorios y casos de uso que necesitaremos
    // Asegúrate de que estos estén disponibles en el módulo que declara este controlador
    // o que WompiModule los importe/exporte adecuadamente.
    @Inject(ITransactionRepository) private readonly transactionRepo: ITransactionRepository,
    @Inject(IProductRepository) private readonly productRepo: IProductRepository,
    // No necesitamos el WompiGateway aquí si solo procesamos la info recibida
  ) {
    this.WOMPI_EVENTS_SECRET = this.configService.get<string>('WOMPI_EVENTS_SECRET')??"";
    if (!this.WOMPI_EVENTS_SECRET) {
      this.logger.error('WOMPI_EVENTS_SECRET no está configurado en .env. La validación de webhooks fallará.');
    }
  }

  private isValidSignature(
    payloadTimestamp: number,
    transactionId: string,
    transactionStatus: string,
    transactionAmountInCents: number,
    receivedSignature: string,
  ): boolean {
    if (!this.WOMPI_EVENTS_SECRET) {
        this.logger.warn('No se puede validar la firma del webhook: WOMPI_EVENTS_SECRET no configurado.');
        return false; // O puedes optar por fallar si la configuración es esencial
    }

    // La cadena a firmar según la documentación de Wompi para eventos es:
    // id_transaccion + estado_transaccion + valor_transaccion_centavos + timestamp_evento + secreto_eventos
    const stringToSign = `${transactionId}${transactionStatus}${transactionAmountInCents}${payloadTimestamp}${this.WOMPI_EVENTS_SECRET}`;
    
    const calculatedSignature = crypto
      .createHash('sha256')
      .update(stringToSign, 'utf8')
      .digest('hex');

    this.logger.debug(`Validating webhook signature:
      String to sign: "${stringToSign}"
      Calculated signature: "${calculatedSignature}"
      Received signature: "${receivedSignature}"`);

    return calculatedSignature === receivedSignature;
  }

  @Post('events') // El endpoint que Wompi llamará: /webhooks/wompi/events
  @HttpCode(HttpStatus.OK) // Respondemos con 200 OK para que Wompi sepa que lo recibimos
  async handleWompiEvent(
    @Body() payload: WompiWebhookPayload,
    // Wompi envía la firma de los eventos en el cuerpo, no en un header x-signature
    // La firma del evento está en payload.signature.checksum
  ) {
    this.logger.log(`Webhook recibido de Wompi: ${payload.event}`);
    this.logger.debug('Payload completo del webhook:', JSON.stringify(payload, null, 2));

    const transactionData = payload.data?.transaction;

    if (!transactionData || !payload.signature || !payload.timestamp) {
      this.logger.error('Payload de webhook inválido o incompleto.');
      throw new BadRequestException('Payload de webhook inválido.');
    }

    // Validar la firma
    const isValid = this.isValidSignature(
      payload.timestamp,
      transactionData.id,
      transactionData.status,
      transactionData.amount_in_cents,
      payload.signature.checksum,
    );

    if (!isValid) {
      this.logger.warn(`Firma de webhook inválida para la transacción de Wompi ID: ${transactionData.id}`);
      // En producción, podrías querer responder con un 401 o 403,
      // pero para que Wompi no reintente indefinidamente, un 200 con log es a veces mejor.
      // Para la prueba, fallar es más claro.
      throw new BadRequestException('Firma de webhook inválida.');
    }

    this.logger.log(`Firma de webhook válida para Wompi TX ID: ${transactionData.id}. Procesando evento...`);

    // Buscar nuestra transacción local usando la referencia interna
    // (payload.data.transaction.reference es NUESTRA referencia)
    const localTransaction = await this.transactionRepo.findByReference(transactionData.reference); 
    // Nota: Necesitarás añadir el método findByReference a tu ITransactionRepository y su implementación

    if (!localTransaction) {
      this.logger.warn(`No se encontró transacción local con referencia: ${transactionData.reference}`);
      // Es importante responder OK para que Wompi no reintente, pero logueamos el problema.
      return { message: 'Evento recibido, pero no se encontró transacción local correspondiente.' };
    }

    // Actualizar el estado de la transacción local si es diferente
    if (localTransaction.status !== transactionData.status) {
      this.logger.log(`Actualizando estado de transacción local ${localTransaction.id} de ${localTransaction.status} a ${transactionData.status}`);
      // Asumimos que updateStatus guarda también el wompiTransactionId y wompiResponse si es necesario
        await this.transactionRepo.updateStatus(localTransaction.id, transactionData.status);
    }

    // Si la transacción fue APROBADA y nuestra transacción local aún no lo reflejaba (o estaba PENDING)
    if (transactionData.status === 'APPROVED' && localTransaction.status !== 'APPROVED') {
      this.logger.log(`Transacción ${transactionData.id} APROBADA. Actualizando stock para producto ID: ${localTransaction.productId}`);
      try {
        await this.productRepo.decreaseStock(localTransaction.productId, 1); // Asumimos 1 unidad
        this.logger.log(`Stock actualizado para producto ID: ${localTransaction.productId}`);
      } catch (stockError) {
        this.logger.error(`Error al actualizar stock para producto ID ${localTransaction.productId} después de pago aprobado:`, stockError);
        // Aquí deberías tener un mecanismo para manejar este error (ej. reintentar, notificar)
      }
    }

    // Aquí podrías añadir lógica para otros estados, como FAILED, VOIDED
    // ej. if (transactionData.status === 'DECLINED' || transactionData.status === 'ERROR') { ... }

    this.logger.log(`Webhook para transacción de Wompi ID ${transactionData.id} procesado con éxito.`);
    return { message: 'Evento de webhook procesado con éxito.' };
  }
}