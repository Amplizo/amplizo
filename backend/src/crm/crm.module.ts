import { Module } from "@nestjs/common";
import { CrmController } from "./crm.controller";
import { CustomerService } from "./customer.service";
import { PurchaseService } from "./purchase.service";
import { FollowUpService } from "./follow-up.service";
import { AssignmentService } from "./assignment.service";
import { ActivityLogService } from "./activity-log.service";
import { AiService } from "./ai.service";
import { ScheduledCallService } from "./scheduled-call.service";
import { FollowUpScheduler } from "./follow-up.scheduler";
import { WebhookController } from "./webhook.controller";
import { WhatsAppModule } from "../whatsapp/whatsapp.module";

@Module({
  controllers: [CrmController, WebhookController],
  providers: [
    CustomerService,
    PurchaseService,
    FollowUpService,
    AssignmentService,
    ActivityLogService,
    AiService,
    ScheduledCallService,
    FollowUpScheduler,
  ],
  imports: [WhatsAppModule],
  exports: [
    CustomerService,
    FollowUpService,
    AssignmentService,
    ActivityLogService,
    AiService,
    ScheduledCallService,
  ],
})
export class CrmModule {}
