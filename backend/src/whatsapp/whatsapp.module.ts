import { Module } from "@nestjs/common";
import { WhatsAppService } from "./whatsapp.service";
import { WhatsAppBusinessService } from "./whatsapp-business.service";
import { WhatsAppController } from "./whatsapp.controller";

@Module({
  providers: [WhatsAppService, WhatsAppBusinessService],
  controllers: [WhatsAppController],
  exports: [WhatsAppService, WhatsAppBusinessService],
})
export class WhatsAppModule {}
