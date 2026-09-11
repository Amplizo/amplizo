import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import helmet from "helmet";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { WinstonLogger } from "./common/services/winston.logger";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule.forRoot(), {
    bufferLogs: false,
    bodyParser: false,
  });

  const logger = app.get(WinstonLogger);
  app.useLogger(logger);

  app.use(
    json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(
    urlencoded({
      extended: true,
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  if (process.env.NODE_ENV === "production") {
    const required = ["JWT_SECRET", "DATABASE_URL", "WHATSAPP_VERIFY_TOKEN"];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      logger.error(`Missing required environment variables: ${missing.join(", ")}`);
      process.exit(1);
    }
    if (!process.env.ALLOWED_ORIGINS) {
      logger.error("ALLOWED_ORIGINS must be set in production");
      process.exit(1);
    }

    const optionalServices: { key: string; name: string; description: string }[] = [
      { key: "SMTP_HOST", name: "SMTP/Email", description: "Password reset and follow-up emails" },
      { key: "TWILIO_ACCOUNT_SID", name: "Twilio SMS", description: "OTP login and follow-up SMS" },
      { key: "RAZORPAY_KEY_ID", name: "Razorpay", description: "Payment processing" },
      { key: "WHATSAPP_ACCESS_TOKEN", name: "WhatsApp Business API", description: "WhatsApp messaging and webhooks" },
    ];
    for (const svc of optionalServices) {
      const value = process.env[svc.key];
      if (!value) {
        logger.warn(`${svc.name} NOT configured (${svc.key} missing). ${svc.description} will be disabled/functional limitations may apply.`);
      }
    }

    if (process.env.PAYMENT_PROVIDER === "razorpay") {
      if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        logger.error("RAZORPAY_WEBHOOK_SECRET is required when PAYMENT_PROVIDER=razorpay in production");
        process.exit(1);
      }
    }

    if (process.env.WHATSAPP_ACCESS_TOKEN) {
      const waRequired = ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_BUSINESS_ACCOUNT_ID", "WHATSAPP_APP_SECRET", "WHATSAPP_VERIFY_TOKEN"];
      const waMissing = waRequired.filter((key) => !process.env[key]);
      if (waMissing.length > 0) {
        logger.error(`Incomplete WhatsApp configuration. Missing: ${waMissing.join(", ")}. All WhatsApp env vars are required if any are set.`);
        process.exit(1);
      }
    }
  }

  app.use(helmet());
  app.set("trust proxy", process.env.TRUST_PROXY || 1);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new AllExceptionsFilter());

  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["http://localhost:3000", "http://localhost:3001"];
  app.enableCors({ origin: allowedOrigins, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], credentials: true });

  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads" });

  const config = new DocumentBuilder().setTitle("Amplizo API").setDescription("Amplizo Live Chat Platform API").setVersion("1.0").addBearerAuth().addTag("auth").addTag("chats").addTag("visitors").addTag("admin").build();

  if (process.env.NODE_ENV !== "production" || process.env.SWAGGER_ENABLED === "true") {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
  }

   const port = process.env.PORT || 4000;
   await app.listen(port, "0.0.0.0");
   logger.log(`Amplizo Backend running on http://0.0.0.0:${port}`, "Bootstrap");
   if (process.env.NODE_ENV !== "production" || process.env.SWAGGER_ENABLED === "true") {
     logger.log(`API Docs: http://localhost:${port}/api/docs`, "Bootstrap");
   }
   logger.log(`WebSocket: ws://localhost:${port}`, "Bootstrap");

   const services: { name: string; ready: boolean; detail?: string }[] = [];
   try {
     const emailService = app.get(require("./common/services/email.service").EmailService);
     services.push({ name: "Email (SMTP)", ready: emailService.isReady() });
   } catch { services.push({ name: "Email (SMTP)", ready: false }); }
   try {
     const smsService = app.get(require("./common/services/sms.service").SmsService);
     services.push({ name: "SMS (Twilio)", ready: smsService.isReady(), detail: smsService.isReady() ? undefined : "Twilio not configured" });
   } catch { services.push({ name: "SMS (Twilio)", ready: false }); }
   try {
     const waService = app.get(require("./whatsapp/whatsapp.service").WhatsAppService);
     services.push({ name: "WhatsApp Business", ready: waService.isReady() });
   } catch { services.push({ name: "WhatsApp Business", ready: false }); }
   for (const svc of services) {
     logger.log(`${svc.name}: ${svc.ready ? "READY" : "NOT CONFIGURED"}${svc.detail ? ` (${svc.detail})` : ""}`, "Bootstrap");
   }
}
bootstrap();
