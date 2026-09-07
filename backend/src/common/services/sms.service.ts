import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SmsService {
  private client: any = null;
  private readonly logger = new Logger("SmsService");
  private readonly isConfigured: boolean;
  private readonly phoneNumber: string;
  private readonly mode: "development" | "production";

  constructor(private prisma: PrismaService) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;
    this.mode = (process.env.SMS_MODE as "development" | "production") || "development";
    this.isConfigured = !!(sid && token && from && sid.startsWith("AC"));
    this.phoneNumber = from || "";

    if (this.isConfigured) {
      try {
        const twilio = require("twilio");
        this.client = twilio(sid, token);
        this.logger.log(`Twilio initialized with from=${from}`);
      } catch (e: any) {
        this.logger.error(`Failed to initialize Twilio: ${e?.message}`);
        this.isConfigured = false;
        this.client = null;
      }
    } else {
      if (this.mode === "production") {
        this.logger.error("Twilio credentials not configured in production mode. SMS sending is disabled.");
      } else {
        this.logger.warn(
          "Twilio credentials not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER). SMS will be MOCKED in development."
        );
      }
    }
  }

  isReady() {
    return this.isConfigured;
  }

  getMode() {
    return this.mode;
  }

  private maskPhone(phone: string): string {
    if (!phone || phone.length < 6) return "****";
    return phone.slice(0, 3) + "****" + phone.slice(-2);
  }

  private normalizeIndianPhone(to: string): string {
    if (!to) return "";
    const trimmed = to.trim().replace(/\s|-/g, "");
    const digits = trimmed.replace(/[^0-9+]/g, "");
    if (digits.startsWith("+")) return digits;
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (digits.length === 13 && digits.startsWith("091")) return `+${digits.slice(1)}`;
    return `+${digits.replace(/^\+/, "")}`;
  }

  private isValidIndianPhone(to: string): boolean {
    const normalized = this.normalizeIndianPhone(to);
    return /^\+91[6-9]\d{9}$/.test(normalized) || /^\+[1-9]\d{7,14}$/.test(normalized);
  }

  async sendSms(to: string, body: string, meta?: { clientId?: string; followUpId?: string; type?: string }) {
    if (!this.isValidIndianPhone(to)) {
      this.logger.warn(`Invalid phone: ${this.maskPhone(to)}`);
      await this.logSms({ to, body, status: "FAILED", error: "Invalid phone", ...meta });
      return { success: false, error: "Invalid phone number" };
    }

    const normalizedTo = this.normalizeIndianPhone(to);

    if (!this.isConfigured || !this.client) {
      if (this.mode === "production") {
        const error = "SMS service not configured in production";
        this.logger.error(`${error}: Twilio credentials missing`);
        await this.logSms({ to: normalizedTo, body, status: "FAILED", error, ...meta });
        return { success: false, error };
      }

      this.logger.log(`[SMS MOCK] To: ${this.maskPhone(normalizedTo)}, Body: ${body}`);
      await this.logSms({ to: normalizedTo, body, status: "MOCKED", sid: `MOCK-${Date.now()}`, ...meta });
      return { success: true, mock: true, sid: `MOCK-${Date.now()}`, to: normalizedTo };
    }

    try {
      const message = await this.client.messages.create({
        body,
        from: this.phoneNumber,
        to: normalizedTo,
      });
      this.logger.log(`SMS sent to ${this.maskPhone(normalizedTo)}: ${message.sid} status=${message.status}`);
      await this.logSms({ to: normalizedTo, body, status: "SENT", sid: message.sid, ...meta });
      return { success: true, sid: message.sid, status: message.status, to: normalizedTo };
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      this.logger.error(`Failed to send SMS to ${this.maskPhone(normalizedTo)}: ${errMsg}`);
      await this.logSms({ to: normalizedTo, body, status: "FAILED", error: errMsg, ...meta });
      return { success: false, error: errMsg, to: normalizedTo };
    }
  }

  async sendOtpSms(to: string, otp: string) {
    const body = `Your Amplizo OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`;
    return this.sendSms(to, body, { type: "OTP" });
  }

  private async logSms(entry: { to: string; body: string; status: string; sid?: string; error?: string; clientId?: string; followUpId?: string; type?: string }) {
    try {
      await this.prisma.smsLog.create({
        data: {
          to: entry.to,
          body: entry.body,
          status: entry.status,
          sid: entry.sid,
          error: entry.error,
          clientId: entry.clientId,
          followUpId: entry.followUpId,
          type: entry.type,
        },
      });
    } catch (e: any) {
      this.logger.error(`Failed to log SMS: ${e?.message}`);
    }
  }
}
