import { Module, DynamicModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { VisitorModule } from "./visitor/visitor.module";
import { ChatModule } from "./chat/chat.module";
import { WebsocketModule } from "./websocket/websocket.module";
import { UploadModule } from "./upload/upload.module";
import { AdminModule } from "./admin/admin.module";
import { NotificationModule } from "./notification/notification.module";
import { CommonModule } from "./common/common.module";
import { CrmModule } from "./crm/crm.module";
import { WhatsAppModule } from "./whatsapp/whatsapp.module";
import { SubscriptionModule } from "./subscription/subscription.module";

@Module({})
export class AppModule {
  static forRoot(): DynamicModule {
    const redisEnabled = process.env.REDIS_ENABLED === "true";
    const bullImports: DynamicModule[] = [];

    if (redisEnabled) {
      const { BullModule } = require("@nestjs/bull");
      bullImports.push(
        BullModule.forRoot({
          redis: {
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379"),
          },
        })
      );
    }

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        ScheduleModule.forRoot(),
        ...bullImports,
        CommonModule.forRoot(),
        PrismaModule,
        AuthModule,
        VisitorModule,
        WebsocketModule,
        UploadModule,
        AdminModule,
        NotificationModule,
        CrmModule,
        WhatsAppModule,
        SubscriptionModule,
      ],
    };
  }
}
