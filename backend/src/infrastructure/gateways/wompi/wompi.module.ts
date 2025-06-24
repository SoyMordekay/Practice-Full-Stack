import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WompiGateway } from './wompi.gateway';
import { WompiWebhookController } from '../../controllers/web-hook.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [WompiWebhookController],
  providers: [WompiGateway],
  exports: [WompiGateway],
})
export class WompiModule {}