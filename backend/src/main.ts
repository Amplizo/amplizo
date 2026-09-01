import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { WinstonLogger } from "./common/services/winston.logger";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule.forRoot(), { bufferLogs: false });

  const logger = app.get(WinstonLogger);
  app.useLogger(logger);

  app.use(helmet());
  app.setGlobalPrefix("api");

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["http://localhost:3000", "http://localhost:3001"];
  app.enableCors({ origin: allowedOrigins, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], credentials: true });

  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads" });

  const config = new DocumentBuilder().setTitle("Amplizo API").setDescription("Amplizo Live Chat Platform API").setVersion("1.0").addBearerAuth().addTag("auth").addTag("chats").addTag("visitors").addTag("admin").build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

   const port = process.env.PORT || 4000;
   await app.listen(port, "0.0.0.0");
   logger.log(`Amplizo Backend running on http://0.0.0.0:${port}`, "Bootstrap");
   logger.log(`API Docs: http://localhost:${port}/api/docs`, "Bootstrap");
   logger.log(`WebSocket: ws://localhost:${port}`, "Bootstrap");
}
bootstrap();
