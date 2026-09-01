import { Global, Module, DynamicModule } from "@nestjs/common";
import { WinstonLogger } from "./services/winston.logger";
import { EmailService } from "./services/email.service";
import { SmsService } from "./services/sms.service";
import { StorageService } from "./services/storage.service";
import { AdminStatsService } from "./services/admin-stats.service";
import { RedisService } from "./services/redis.service";
import { SentryService } from "./services/sentry.service";
import { PrometheusService } from "./services/prometheus.service";
import { EmailProcessor } from "./processors/email.processor";
import { PrometheusController } from "./controllers/prometheus.controller";

@Global()
@Module({})
export class CommonModule {
  static forRoot(): DynamicModule {
    const redisEnabled = process.env.REDIS_ENABLED === "true";
    const imports: DynamicModule[] = [];
    const providers: any[] = [WinstonLogger, EmailService, SmsService, StorageService, AdminStatsService, RedisService, SentryService, PrometheusService];

    if (redisEnabled) {
      const { BullModule } = require("@nestjs/bull");
      imports.push(BullModule.registerQueue({ name: "emails" }));
      providers.push(EmailProcessor);
    }

    return {
      module: CommonModule,
      imports,
      controllers: [PrometheusController],
      providers,
      exports: [WinstonLogger, EmailService, SmsService, StorageService, AdminStatsService, RedisService, SentryService, PrometheusService],
    };
  }
}
