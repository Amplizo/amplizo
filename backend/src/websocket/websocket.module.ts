import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatModule } from "../chat/chat.module";
import { AuthModule } from "../auth/auth.module";
import { CrmModule } from "../crm/crm.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ChatModule,
    AuthModule,
    CrmModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET") || "amplizo-secret-key-change-in-production",
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN") || "15m" },
      }),
    }),
  ],
  providers: [ChatGateway],
})
export class WebsocketModule {}
