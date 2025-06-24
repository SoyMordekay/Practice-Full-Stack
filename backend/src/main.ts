import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/app.module'; // O la ruta correcta

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true, // Asegúrate que bodyParser está habilitado
  });

  // Habilitar CORS
  app.enableCors();

  // Esto es necesario si quieres usar @RawBody() en el controlador.
  // Si solo usas @Body() y la firma viene en el payload como payload.signature.checksum, no es estrictamente necesario,
  // pero si la firma se calcula sobre el cuerpo crudo, sí.
  // Para la firma de eventos de Wompi, la firma se genera sobre campos específicos, no el cuerpo crudo.
  // Así que la validación que hice arriba (usando campos del payload) es la correcta.
  // El bodyParser: true es suficiente.

  await app.listen(3000);
}
void bootstrap();
