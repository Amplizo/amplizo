import { Module } from "@nestjs/common";
import { WhatsAppService } from "./whatsapp.service";
import { WhatsAppBusinessService } from "./whatsapp-business.service";
import { WhatsAppController } from "./whatsapp.controller";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [NotificationModule],
  providers: [WhatsAppService, WhatsAppBusinessService],
  controllers: [WhatsAppController],
  exports: [WhatsAppService, WhatsAppBusinessService],
})
export class WhatsAppModule {}
