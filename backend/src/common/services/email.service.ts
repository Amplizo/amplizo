import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger("EmailService");
  private readonly enabled = process.env.SMTP_HOST && process.env.SMTP_USER;

  constructor() {
    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    }
  }

  isReady() {
    return this.enabled;
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.enabled) {
      this.logger.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
      return { success: true, mock: true };
    }
    try {
      const info = await this.transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string, name: string) {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Password Reset - Amplizo</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
    return this.sendEmail(to, "Password Reset - Amplizo", html);
  }

  async sendOtpEmail(to: string, otp: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Your OTP - Amplizo</h2>
        <p>Hi ${name},</p>
        <p>Your one-time password (OTP) is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #4f46e5; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center; letter-spacing: 8px;">${otp}</div>
        <p>This OTP expires in 5 minutes.</p>
      </div>
    `;
    return this.sendEmail(to, "Your OTP - Amplizo", html);
  }
}
