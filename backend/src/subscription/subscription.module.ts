import { Module } from "@nestjs/common";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionService } from "./subscription.service";
import { PaymentWebhookController } from "./payment-webhook.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  controllers: [SubscriptionController, PaymentWebhookController],
  providers: [SubscriptionService],
  imports: [PrismaModule],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
