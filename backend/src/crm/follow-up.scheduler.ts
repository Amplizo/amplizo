import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { FollowUpService } from "./follow-up.service";
import { AIFollowUpService } from "./ai-followup.service";

@Injectable()
export class FollowUpScheduler {
  private readonly logger = new Logger("FollowUpScheduler");
  constructor(
    private followUpService: FollowUpService,
    private aiFollowUpService: AIFollowUpService,
  ) {}

  @Cron("*/5 * * * *")
  async handleCron() {
    this.logger.log("Running scheduled AI follow-up processing...");
    try {
      const results = await this.followUpService.processDueFollowUps(undefined);
      for (const result of results) {
        if (result.success) {
          await this.aiFollowUpService.updateLeadStatus(result.followUpId);
        }
      }
      this.logger.log(`Processed ${results.length} AI follow-ups`);
    } catch (e: any) {
      this.logger.error(`Scheduler error: ${e?.message}`);
    }
  }
}
