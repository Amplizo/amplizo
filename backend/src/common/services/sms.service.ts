import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class SmsService {
  private client: any = null;
  private readonly logger = new Logger("SmsService");
  private readonly enabled = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_ACCOUNT_SID.startsWith("AC");

  constructor() {
    if (this.enabled) {
      const twilio = require("twilio");
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  async sendSms(to: string, body: string) {
    if (!this.enabled || !this.client) {
      this.logger.log(`[SMS MOCK] To: ${to}, Body: ${body}`);
      return { success: true, mock: true, sid: `MOCK-${Date.now()}` };
    }
    try {
      const message = await this.client.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to });
      this.logger.log(`SMS sent to ${to}: ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendOtpSms(to: string, otp: string) {
    const body = `Your Amplizo OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`;
    return this.sendSms(to, body);
  }
}
