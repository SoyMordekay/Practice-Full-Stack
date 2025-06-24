"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./infrastructure/app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: true,
    });
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Full Stack Technical API')
        .setDescription('Documentación de la API para la tienda y pagos')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map