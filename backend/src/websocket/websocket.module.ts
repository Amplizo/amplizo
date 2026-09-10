import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatModule } from "../chat/chat.module";
import { AuthModule } from "../auth/auth.module";
import { CrmModule } from "../crm/crm.module";
import { NotificationModule } from "../notification/notification.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ChatModule,
    AuthModule,
    CrmModule,
    NotificationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>("JWT_SECRET");
        if (!secret && process.env.NODE_ENV === "production") {
          throw new Error("JWT_SECRET is required in production");
        }
        return { secret, signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN") || "15m" } };
      },
    }),
  ],
  providers: [ChatGateway],
})
export class WebsocketModule {}
