import { Processor } from "@nestjs/bull";
import { Job, DoneCallback } from "bull";
import { Logger, Inject } from "@nestjs/common";
import { EmailService } from "../services/email.service";

@Processor("emails")
export class EmailProcessor {
  private readonly logger = new Logger("EmailProcessor");

  constructor(@Inject(EmailService) private emailService: EmailService) {}

  async process(job: Job, done: DoneCallback) {
    try {
      switch (job.name) {
        case "send-email":
          await this.emailService.sendEmail(job.data.to, job.data.subject, job.data.html);
          break;
        case "password-reset":
          await this.emailService.sendPasswordResetEmail(job.data.to, job.data.token, job.data.name);
          break;
        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
      }
      done(null, { success: true });
    } catch (error) {
      done(error as Error, null);
    }
  }
}
