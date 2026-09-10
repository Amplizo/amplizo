import { Injectable, UnauthorizedException, BadRequestException, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../common/services/email.service";
import { SmsService } from "../common/services/sms.service";
import { v4 as uuidv4 } from "uuid";
import * as argon2 from "argon2";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { Request } from "express";
import { createHmac, randomInt } from "crypto";

const OTP_PEPPER = process.env.OTP_PEPPER || process.env.JWT_SECRET || "amplizo-otp-pepper-dev-only";
if (process.env.NODE_ENV === "production" && !process.env.OTP_PEPPER && !process.env.JWT_SECRET) {
  throw new Error("OTP_PEPPER or JWT_SECRET is required in production");
}
const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const OTP_RATE_LIMIT_MAX = 3; // max 3 OTPs per phone per hour

function hashOtp(otp: string): string {
  return createHmac("sha256", OTP_PEPPER).update(otp).digest("hex");
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  private getClientIp(request?: Request): string {
    if (!request) return "unknown";
    return (request.ip || request.connection?.remoteAddress || "unknown") as string;
  }

  private getUserAgent(request?: Request): string {
    if (!request) return "unknown";
    return (request.headers?.["user-agent"] as string) || "unknown";
  }

  async login(loginDto: LoginDto) {
    const agent = await this.prisma.agent.findUnique({ where: { email: loginDto.email } });
    if (!agent) throw new UnauthorizedException("Invalid credentials");
    const isPasswordValid = await argon2.verify(agent.password, loginDto.password);
    if (!isPasswordValid) throw new UnauthorizedException("Invalid credentials");
    return this.generateTokens(agent);
  }

  async signup(signupDto: SignupDto) {
    const existingAgent = await this.prisma.agent.findUnique({ where: { email: signupDto.email } });
    if (existingAgent) throw new BadRequestException("Email already registered");
    const hashedPassword = await argon2.hash(signupDto.password);
    const agent = await this.prisma.agent.create({
      data: { name: signupDto.name, email: signupDto.email, password: hashedPassword, role: "agent" },
    });
    return this.generateTokens(agent);
  }

  async validateOAuthUser(data: { provider: string; providerId: string; email?: string; name?: string; avatar?: string }) {
    let agent = await this.prisma.agent.findFirst({ where: { email: data.email } });
    if (!agent) {
      agent = await this.prisma.agent.create({
        data: { name: data.name || "User", email: data.email || `${data.provider}_${data.providerId}@oauth.com`, password: await argon2.hash(uuidv4()), role: "agent", avatar: data.avatar, status: "online" },
      });
    }
    await this.prisma.agent.update({ where: { id: agent.id }, data: { status: "online" } });
    return this.generateTokens(agent);
  }

  async sendOtp(phone: string, request?: any) {
    const normalized = this.normalizePhone(phone);
    if (!normalized) throw new BadRequestException("Invalid phone number");

    const now = new Date();
    const windowStart = new Date(now.getTime() - OTP_RATE_LIMIT_WINDOW_MS);

    const recentCount = await this.prisma.oTP.count({
      where: {
        phone: normalized,
        createdAt: { gte: windowStart },
      },
    });

    if (recentCount >= OTP_RATE_LIMIT_MAX) {
      const oldest = await this.prisma.oTP.findFirst({
        where: { phone: normalized },
        orderBy: { createdAt: "asc" },
      });
      const retryAfter = oldest ? Math.ceil((oldest.createdAt.getTime() + OTP_RATE_LIMIT_WINDOW_MS - now.getTime()) / 1000) : 60;
      throw new BadRequestException(`Too many OTP requests. Please try again in ${retryAfter} seconds`);
    }

    const otp = this.generateSecureOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.oTP.upsert({
      where: { phone: normalized },
      update: { otpHash, expiresAt, verified: false, attempts: 0, lastAttemptAt: null, ipAddress: this.getClientIp(request), userAgent: this.getUserAgent(request) },
      create: { phone: normalized, otpHash, expiresAt, verified: false, attempts: 0, ipAddress: this.getClientIp(request), userAgent: this.getUserAgent(request) },
    });

    const smsResult = await this.smsService.sendOtpSms(normalized, otp);
    if (!smsResult.success) {
      throw new BadRequestException(smsResult.error || "Failed to send OTP");
    }

    return { success: true, message: `OTP sent to ${this.maskPhone(normalized)}` };
  }

  async verifyOtp(phone: string, otp: string, request?: any) {
    const normalized = this.normalizePhone(phone);
    if (!normalized || !otp || otp.length !== 6) {
      throw new UnauthorizedException("Invalid OTP format");
    }

    const record = await this.prisma.oTP.findUnique({ where: { phone: normalized } });
    if (!record) throw new UnauthorizedException("Invalid or expired OTP");

    if (record.verified) {
      throw new UnauthorizedException("OTP has already been used");
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException("OTP has expired");
    }

    if (record.attempts >= record.maxAttempts) {
      throw new UnauthorizedException("Maximum OTP attempts exceeded. Please request a new OTP");
    }

    const otpHash = hashOtp(otp);
    const isValid = otpHash === record.otpHash;

    await this.prisma.oTP.update({
      where: { phone: normalized },
      data: {
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
        ...(isValid ? { verified: true } : {}),
      },
    });

    if (!isValid) {
      const remaining = record.maxAttempts - record.attempts - 1;
      throw new UnauthorizedException(`Invalid OTP. ${remaining} attempts remaining`);
    }

    let agent = await this.prisma.agent.findFirst({ where: { name: normalized } });
    if (!agent) {
      agent = await this.prisma.agent.create({ data: { name: normalized, email: `${normalized}@phone.com`, password: await argon2.hash(uuidv4()), role: "agent", status: "online" } });
    }
    await this.prisma.agent.update({ where: { id: agent.id }, data: { status: "online" } });
    return this.generateTokens(agent);
  }

  async phoneLogin(phone: string, name?: string) {
    let agent = await this.prisma.agent.findFirst({ where: { name: phone } });
    if (!agent) {
      agent = await this.prisma.agent.create({ data: { name: name || phone, email: `${phone}@phone.com`, password: await argon2.hash(uuidv4()), role: "agent", status: "online" } });
    }
    await this.prisma.agent.update({ where: { id: agent.id }, data: { status: "online" } });
    return this.generateTokens(agent);
  }

  async forgotPassword(email: string) {
    const agent = await this.prisma.agent.findUnique({ where: { email } });
    if (!agent) return { success: true, message: "If this email exists, a reset link will be sent" };

    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.passwordReset.upsert({
      where: { agentId: agent.id },
      update: { token: resetToken, expiresAt, used: false },
      create: { agentId: agent.id, token: resetToken, expiresAt, used: false },
    });

    await this.emailService.sendPasswordResetEmail(email, resetToken, agent.name);
    return { success: true, message: "If this email exists, a reset link will be sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordReset.findUnique({ where: { token }, include: { agent: true } });
    if (!record || record.expiresAt < new Date() || record.used) throw new UnauthorizedException("Invalid or expired reset token");

    await this.prisma.agent.update({ where: { id: record.agentId }, data: { password: await argon2.hash(newPassword) } });
    await this.prisma.passwordReset.update({ where: { id: record.id }, data: { used: true } });

    return { success: true, message: "Password reset successful" };
  }

  private generateSecureOtp(): string {
    return String(randomInt(100000, 999999));
  }

  private normalizePhone(phone: string): string {
    if (!phone) return "";
    const trimmed = phone.trim().replace(/\s|-/g, "");
    const digits = trimmed.replace(/[^0-9+]/g, "");
    if (digits.startsWith("+")) return digits;
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (digits.length === 13 && digits.startsWith("091")) return `+${digits.slice(1)}`;
    return `+${digits.replace(/^\+/, "")}`;
  }

  private maskPhone(phone: string): string {
    if (!phone || phone.length < 6) return "****";
    return phone.slice(0, 3) + "****" + phone.slice(-2);
  }

  private async generateTokens(agent: any) {
    const payload = { sub: agent.id, email: agent.email, role: agent.role };
    const token = this.jwtService.sign(payload);
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({ data: { token: refreshToken, agentId: agent.id, expiresAt } });
    const { password, ...agentData } = agent;
    return { agent: { id: agentData.id, name: agentData.name, email: agentData.email, role: agentData.role, avatar: agentData.avatar, status: "online", createdAt: agentData.createdAt?.toISOString?.() || new Date().toISOString() }, token, refreshToken };
  }

  async refreshTokenFn(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { agent: true } });
    if (!storedToken || storedToken.expiresAt < new Date()) throw new UnauthorizedException("Invalid refresh token");
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
    const payload = { sub: storedToken.agent.id, email: storedToken.agent.email, role: storedToken.agent.role };
    const token = this.jwtService.sign(payload);
    const newRefreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({ data: { token: newRefreshToken, agentId: storedToken.agent.id, expiresAt } });
    return { token, refreshToken: newRefreshToken };
  }

  async logout(agentId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { agentId } });
    await this.prisma.agent.update({ where: { id: agentId }, data: { status: "offline" } });
  }
}
