import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { FollowUpService } from "./follow-up.service";

@Injectable()
export class FollowUpScheduler {
  private readonly logger = new Logger("FollowUpScheduler");
  constructor(private followUpService: FollowUpService) {}

  @Cron("*/5 * * * *")
  async handleCron() {
    this.logger.log("Running scheduled follow-up processing...");
    try {
      const results = await this.followUpService.processDueFollowUps(undefined);
      this.logger.log(`Processed ${results.length} due follow-ups`);
    } catch (e: any) {
      this.logger.error(`Scheduler error: ${e?.message}`);
    }
  }
}
