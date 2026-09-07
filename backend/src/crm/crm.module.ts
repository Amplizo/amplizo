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
import { ImportExportController } from "./import-export.controller";
import { ImportExportService } from "./import-export.service";
import { AIFollowUpService } from "./ai-followup.service";
import { WhatsAppModule } from "../whatsapp/whatsapp.module";
import { CommonModule } from "../common/common.module";

@Module({
  controllers: [CrmController, ImportExportController],
  providers: [
    CustomerService,
    PurchaseService,
    FollowUpService,
    AssignmentService,
    ActivityLogService,
    AiService,
    ScheduledCallService,
    FollowUpScheduler,
    ImportExportService,
    AIFollowUpService,
  ],
  imports: [WhatsAppModule, CommonModule],
  exports: [
    CustomerService,
    FollowUpService,
    AssignmentService,
    ActivityLogService,
    AiService,
    ScheduledCallService,
    ImportExportService,
    AIFollowUpService,
  ],
})
export class CrmModule {}
